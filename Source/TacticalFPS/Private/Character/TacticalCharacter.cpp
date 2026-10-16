// Copyright Project Tactical Strike. All Rights Reserved.

#include "Character/TacticalCharacter.h"
#include "TacticalFPS.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "GameFramework/PlayerController.h"

ATacticalCharacter::ATacticalCharacter()
{
	PrimaryActorTick.bCanEverTick = true;

	// 1. Setup Capsule Dimensions
	// Standard tactical FPS geometry: 38cm radius, 92cm half-height (fits 100cm doorways)
	GetCapsuleComponent()->InitCapsuleSize(38.0f, 92.0f);
	GetCapsuleComponent()->SetCollisionProfileName(UCollisionProfile::Pawn_ProfileName);

	// 2. Setup First Person Camera
	// Placed at eye level (~165 cm above base: 92cm half-height + 64cm camera offset = ~156cm eye level)
	FirstPersonCameraComponent = CreateDefaultSubobject<UCameraComponent>(TEXT("FirstPersonCamera"));
	FirstPersonCameraComponent->SetupAttachment(GetCapsuleComponent());
	FirstPersonCameraComponent->SetRelativeLocation(FVector(0.0f, 0.0f, 64.0f));
	FirstPersonCameraComponent->bUsePawnControlRotation = true;

	// 3. Configure Character Locomotion
	bUseControllerRotationPitch = false;
	bUseControllerRotationYaw = true;
	bUseControllerRotationRoll = false;

	UCharacterMovementComponent* MoveComp = GetCharacterMovement();
	MoveComp->bOrientRotationToMovement = false;
	MoveComp->bUseControllerDesiredRotation = false;

	// Speeds (uu/s)
	StandingSpeed = 250.0f;
	WalkingSpeed = 130.0f;
	CrouchingSpeed = 85.0f;

	// Apply tactical friction and acceleration parameters
	MoveComp->MaxWalkSpeed = StandingSpeed;
	MoveComp->MaxWalkSpeedCrouched = CrouchingSpeed;
	MoveComp->MaxAcceleration = 2400.0f;
	MoveComp->BrakingDecelerationWalking = 2400.0f;
	MoveComp->GroundFriction = 8.0f;
	MoveComp->BrakingFrictionFactor = 1.5f;

	// Air mechanics: tight jump with minimal air-strafing to prevent bunny-hopping exploits
	MoveComp->JumpZVelocity = 380.0f;
	MoveComp->AirControl = 0.15f;
	MoveComp->BrakingDecelerationFalling = 50.0f;

	// Enable Crouch
	MoveComp->GetNavAgentPropertiesRef().bCanCrouch = true;
	MoveComp->SetCrouchedHalfHeight(60.0f);

	// Stance & Input Defaults
	CurrentStance = ETacticalStance::Standing;
	bWantsToWalk = false;
	MouseSensitivityYaw = 1.0f;
	MouseSensitivityPitch = 1.0f;
}

void ATacticalCharacter::BeginPlay()
{
	Super::BeginPlay();

	// Add Input Mapping Context to Enhanced Input Subsystem
	if (APlayerController* PlayerController = Cast<APlayerController>(Controller))
	{
		if (UEnhancedInputLocalPlayerSubsystem* Subsystem = ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PlayerController->GetLocalPlayer()))
		{
			if (DefaultMappingContext)
			{
				Subsystem->AddMappingContext(DefaultMappingContext, 0);
				UE_LOG(LogTacticalFPS, Log, TEXT("TacticalCharacter: Successfully bound DefaultMappingContext."));
			}
		}
	}
}

void ATacticalCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	if (UEnhancedInputComponent* EnhancedInputComponent = Cast<UEnhancedInputComponent>(PlayerInputComponent))
	{
		// Moving (WASD)
		if (MoveAction)
		{
			EnhancedInputComponent->BindAction(MoveAction, ETriggerEvent::Triggered, this, &ATacticalCharacter::Move);
		}

		// Looking (Mouse X / Y)
		if (LookAction)
		{
			EnhancedInputComponent->BindAction(LookAction, ETriggerEvent::Triggered, this, &ATacticalCharacter::Look);
		}

		// Jumping (Space)
		if (JumpAction)
		{
			EnhancedInputComponent->BindAction(JumpAction, ETriggerEvent::Started, this, &ATacticalCharacter::StartJump);
			EnhancedInputComponent->BindAction(JumpAction, ETriggerEvent::Completed, this, &ATacticalCharacter::StopJump);
		}

		// Crouching (Ctrl)
		if (CrouchAction)
		{
			EnhancedInputComponent->BindAction(CrouchAction, ETriggerEvent::Started, this, &ATacticalCharacter::StartCrouch);
			EnhancedInputComponent->BindAction(CrouchAction, ETriggerEvent::Completed, this, &ATacticalCharacter::StopCrouch);
		}

		// Tactical Walk (Shift)
		if (WalkAction)
		{
			EnhancedInputComponent->BindAction(WalkAction, ETriggerEvent::Started, this, &ATacticalCharacter::StartWalk);
			EnhancedInputComponent->BindAction(WalkAction, ETriggerEvent::Completed, this, &ATacticalCharacter::StopWalk);
		}
	}
	else
	{
		UE_LOG(LogTacticalFPS, Error, TEXT("TacticalCharacter: Failed to cast to UEnhancedInputComponent!"));
	}
}

void ATacticalCharacter::Move(const FInputActionValue& Value)
{
	const FVector2D MovementVector = Value.Get<FVector2D>();

	if (Controller != nullptr)
	{
		// Find forward and right directions based on yaw rotation
		const FRotator Rotation = Controller->GetControlRotation();
		const FRotator YawRotation(0.0f, Rotation.Yaw, 0.0f);

		const FVector ForwardDirection = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X);
		const FVector RightDirection = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::Y);

		AddMovementInput(ForwardDirection, MovementVector.Y);
		AddMovementInput(RightDirection, MovementVector.X);
	}
}

void ATacticalCharacter::Look(const FInputActionValue& Value)
{
	const FVector2D LookAxisVector = Value.Get<FVector2D>();

	if (Controller != nullptr)
	{
		AddControllerYawInput(LookAxisVector.X * MouseSensitivityYaw);
		AddControllerPitchInput(LookAxisVector.Y * MouseSensitivityPitch);
	}
}

void ATacticalCharacter::StartJump()
{
	// Prevent jumping while crouched
	if (!bIsCrouched)
	{
		Jump();
	}
}

void ATacticalCharacter::StopJump()
{
	StopJumping();
}

void ATacticalCharacter::StartCrouch()
{
	Crouch();
	CurrentStance = ETacticalStance::Crouching;
	UpdateMovementSpeed();
}

void ATacticalCharacter::StopCrouch()
{
	UnCrouch();
	CurrentStance = bWantsToWalk ? ETacticalStance::Walking : ETacticalStance::Standing;
	UpdateMovementSpeed();
}

void ATacticalCharacter::StartWalk()
{
	bWantsToWalk = true;
	if (!bIsCrouched)
	{
		CurrentStance = ETacticalStance::Walking;
		UpdateMovementSpeed();
	}
}

void ATacticalCharacter::StopWalk()
{
	bWantsToWalk = false;
	if (!bIsCrouched)
	{
		CurrentStance = ETacticalStance::Standing;
		UpdateMovementSpeed();
	}
}

void ATacticalCharacter::UpdateMovementSpeed()
{
	UCharacterMovementComponent* MoveComp = GetCharacterMovement();
	if (!MoveComp) return;

	switch (CurrentStance)
	{
	case ETacticalStance::Crouching:
		MoveComp->MaxWalkSpeed = CrouchingSpeed;
		break;
	case ETacticalStance::Walking:
		MoveComp->MaxWalkSpeed = WalkingSpeed;
		break;
	case ETacticalStance::Standing:
	default:
		MoveComp->MaxWalkSpeed = StandingSpeed;
		break;
	}
}
