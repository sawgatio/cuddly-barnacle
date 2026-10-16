// Copyright Project Tactical Strike. All Rights Reserved.

using UnrealBuildTool;

public class TacticalFPS : ModuleRules
{
	public TacticalFPS(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] {
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",
			"EnhancedInput"
		});

		PrivateDependencyModuleNames.AddRange(new string[] {
		});
	}
}
