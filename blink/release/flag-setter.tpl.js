var releaseFlags = @@RELEASE_FLAGS;

if (!!flags) {
    for (var flagName in releaseFlags) {
        if (releaseFlags.hasOwnProperty(flagName)) {
            flags.setReleaseOverride(flagName, releaseFlags[flagName]);
        }
    }
}
