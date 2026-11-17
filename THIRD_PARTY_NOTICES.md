# Third-party notices

The repository-level source-available license applies only to code and assets for which the stated copyright holder has the necessary rights. It does not replace third-party licenses.

## Gradle wrapper

The Gradle wrapper scripts and `android/gradle/wrapper/gradle-wrapper.jar` are third-party Gradle build tooling under Apache License 2.0. Original copyright/SPDX headers were retained. The license embedded in the wrapper JAR is reproduced at `third_party_licenses/Gradle-Apache-2.0.txt`.

The JAR SHA-256 is `2db75c40782f5e8ba1fc278a5574bab070adccb2d21ca5a6e5ed840888448046`, matching the official Gradle 8.10.2 wrapper checksum at https://gradle.org/release-checksums/ . This verifies the wrapper bytes, not the security or licensing of all downloaded dependencies.

## Application dependencies

React, React Native, Expo, Firebase, RevenueCat, React Navigation, vector-icon packages and other dependencies listed in `package.json`/`package-lock.json` retain their respective copyright notices and upstream licenses. Their installed source is not vendored in this repository. Dependency licenses must be reviewed and included as required when distributing an application build.

## Product artwork and omitted media

The product icon/cover/splash artwork was recovered from the owner's MyBrainly project and is reserved as product branding, subject to the ownership limitations in `NOTICE`. No ownership of third-party artwork is claimed by the repository-level license. The preparation did not establish a separate per-file provenance chain for every product image.

The two original feedback sound files were omitted because their redistribution license was not documented. The showcase uses built-in device vibration instead and includes no replacement third-party audio samples.
