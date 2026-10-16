// Copyright Project Tactical Strike. All Rights Reserved.

#include "Game/TacticalGameMode.h"
#include "Character/TacticalCharacter.h"
#include "Game/TacticalPlayerController.h"
#include "TacticalFPS.h"

ATacticalGameMode::ATacticalGameMode()
{
	// Set default pawn to our replicated tactical character
	DefaultPawnClass = ATacticalCharacter::StaticClass();

	// Set default player controller to our tactical player controller
	PlayerControllerClass = ATacticalPlayerController::StaticClass();

	// Support smooth map transitions in multiplayer
	bUseSeamlessTravel = true;
}

void ATacticalGameMode::PostLogin(APlayerController* NewPlayer)
{
	Super::PostLogin(NewPlayer);

	if (NewPlayer)
	{
		UE_LOG(LogTacticalFPS, Log, TEXT("TacticalGameMode: Player %s connected to the multiplayer session."), *NewPlayer->GetName());
	}
}
