# Analysis of e1 Player

This document provides an analysis of the e1 player.

## Embed

The player uses an embed html structure to display content. E.g.: `https://megacloud.blog/embed-2/v3/e-1/SJIUEcSQSzUR?k=`. As you can see, the URL contains 2 important features: the video ID (`SJIUEcSQSzUR`) and the player version (`v3`).

#### Video ID

Also called the XRAX, the video ID is a unique identifier for each video. It is used to fetch the video content from the server. The unique quirk of this ID is that it's not always the same. The ID will, after a while, delete itself and switch to a new one. This is done to act like it's moderating it's users file uploads to avoid copyright issues.

#### Player Version

The player version is used to determine which version of the player to use. The player version can be found in the URL, e.g., `v3`. This is important because different versions of the player may have different features or behaviors. For example, the `v3` player now uses a client key acting as a salt to the main decryption key. But the `v2` player doesn't include the client key, and instead they still have an updating key but its with AES, and doesn't include a salt.

##### Client Key

To expand on the client key, it is a unique identifier for each request. It cannot be used multiple times, and it is used to salt the main decryption key.

##### Extras

They use jwplayer for the player and the decrypted sources and subtitles are stored in its setup function.

## Player Loader

The player loader is in a JavaScript link thats loaded in the embed HTML. It's obfuscated with jscrambler, but it can be deobfuscated with https://github.com/Ciarands/jscrambler-deobfuscator.

#### Detections
