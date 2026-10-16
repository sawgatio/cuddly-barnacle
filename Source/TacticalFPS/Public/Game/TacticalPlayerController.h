// Copyright Project Tactical Strike. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "TacticalPlayerController.generated.h"

/**
 * Player Controller managing tactical camera clamping and session lifecycle
 */
UCLASS()
class TACTICALFPS_API ATacticalPlayerController : public APlayerController
{
	GENERATED_BODY()

public:
	ATacticalPlayerController();

protected:
	virtual void BeginPlay() override;

public:
	/** Restarts current level cleanly */
	UFUNCTION(BlueprintCallable, Category = "Tactical|Session")
	void RestartCurrentLevel();
};
