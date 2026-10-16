// Copyright Project Tactical Strike. All Rights Reserved.

#include "Game/TacticalGameMode.h"
#include "Character/TacticalCharacter.h"
#include "Game/TacticalPlayerController.h"

ATacticalGameMode::ATacticalGameMode()
{
	// Set default pawn to our tactical character
	DefaultPawnClass = ATacticalCharacter::StaticClass();

	// Set default player controller to our tactical player controller
	PlayerControllerClass = ATacticalPlayerController::StaticClass();
}
