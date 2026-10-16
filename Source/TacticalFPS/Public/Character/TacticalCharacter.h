// Copyright Project Tactical Strike. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "InputActionValue.h"
#include "TacticalCharacter.generated.h"

class UCameraComponent;
class UInputMappingContext;
class UInputAction;

/**
 * Player stance state machine
 */
UENUM(BlueprintType)
enum class ETacticalStance : uint8
{
	Standing UMETA(DisplayName = "Standing"),
	Walking UMETA(DisplayName = "Walking"),
	Crouching UMETA(DisplayName = "Crouching")
};

UCLASS(config=Game)
class TACTICALFPS_API ATacticalCharacter : public ACharacter
{
	GENERATED_BODY()

	/** First-person camera component */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UCameraComponent> FirstPersonCameraComponent;

public:
	ATacticalCharacter();

protected:
	virtual void BeginPlay() override;
	virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;
	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

	/** Called for movement input (WASD / Left Virtual Joystick) */
	void Move(const FInputActionValue& Value);

	/** Called for look input (Mouse / Right Touch Drag) */
	void Look(const FInputActionValue& Value);

	/** Jump handlers */
	void StartJump();
	void StopJump();

	/** Crouch handlers */
	void StartCrouch();
	void StopCrouch();

	/** Tactical walk handlers (silent slow walk) */
	void StartWalk();
	void StopWalk();

	/** Recomputes current max speed based on stance */
	void UpdateMovementSpeed();

	/** Network Server RPCs for multiplayer replication */
	UFUNCTION(Server, Reliable)
	void Server_StartCrouch();

	UFUNCTION(Server, Reliable)
	void Server_StopCrouch();

	UFUNCTION(Server, Reliable)
	void Server_StartWalk();

	UFUNCTION(Server, Reliable)
	void Server_StopWalk();

	/** Replication notify for stance updates on simulated proxies */
	UFUNCTION()
	void OnRep_CurrentStance();

public:
	/** Returns the first person camera subobject */
	FORCEINLINE UCameraComponent* GetFirstPersonCameraComponent() const { return FirstPersonCameraComponent; }

	/** Current movement stance (Replicated to all clients) */
	UPROPERTY(ReplicatedUsing = OnRep_CurrentStance, VisibleAnywhere, BlueprintReadOnly, Category = "Tactical|Movement")
	ETacticalStance CurrentStance;

	/** Stance movement speed configurations (uu/s) derived from RESEARCH.md */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tactical|Movement")
	float StandingSpeed;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tactical|Movement")
	float WalkingSpeed;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tactical|Movement")
	float CrouchingSpeed;

	/** Mouse / Touch sensitivity multipliers */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tactical|Input")
	float MouseSensitivityYaw;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tactical|Input")
	float MouseSensitivityPitch;

protected:
	/** Enhanced Input Mapping Context */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Tactical|Input")
	TObjectPtr<UInputMappingContext> DefaultMappingContext;

	/** Move Input Action */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Tactical|Input")
	TObjectPtr<UInputAction> MoveAction;

	/** Look Input Action */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Tactical|Input")
	TObjectPtr<UInputAction> LookAction;

	/** Jump Input Action */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Tactical|Input")
	TObjectPtr<UInputAction> JumpAction;

	/** Crouch Input Action */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Tactical|Input")
	TObjectPtr<UInputAction> CrouchAction;

	/** Walk Input Action (Shift) */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Tactical|Input")
	TObjectPtr<UInputAction> WalkAction;

private:
	bool bWantsToWalk;
};
