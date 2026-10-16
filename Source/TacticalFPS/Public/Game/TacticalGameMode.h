// Copyright Project Tactical Strike. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "TacticalGameMode.generated.h"

/**
 * Base game mode for Project Tactical Strike supporting multiplayer sessions
 */
UCLASS()
class TACTICALFPS_API ATacticalGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	ATacticalGameMode();

	virtual void PostLogin(APlayerController* NewPlayer) override;
};
