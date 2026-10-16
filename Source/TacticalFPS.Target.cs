// Copyright Project Tactical Strike. All Rights Reserved.

using UnrealBuildTool;
using System.Collections.Generic;

public class TacticalFPSTarget : TargetRules
{
	public TacticalFPSTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;
		DefaultBuildSettings = BuildSettingsVersion.Latest;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("TacticalFPS");
	}
}
