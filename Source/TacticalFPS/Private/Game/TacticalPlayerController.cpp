// Copyright Project Tactical Strike. All Rights Reserved.

#include "Game/TacticalPlayerController.h"
#include "TacticalFPS.h"
#include "Camera/PlayerCameraManager.h"
#include "Kismet/GameplayStatics.h"

ATacticalPlayerController::ATacticalPlayerController()
{
	bShowMouseCursor = false;
}

void ATacticalPlayerController::BeginPlay()
{
	Super::BeginPlay();

	// Clamp camera pitch strictly to [-89.0f, +89.0f] to prevent disorientation and camera flips
	if (PlayerCameraManager)
	{
		PlayerCameraManager->ViewPitchMin = -89.0f;
		PlayerCameraManager->ViewPitchMax = 89.0f;
		UE_LOG(LogTacticalFPS, Log, TEXT("TacticalPlayerController: Camera pitch limits clamped to [-89, +89]."));
	}
}

void ATacticalPlayerController::RestartCurrentLevel()
{
	const FString CurrentMapName = GetWorld()->GetMapName();
	UGameplayStatics::OpenLevel(this, FName(*CurrentMapName));
}
