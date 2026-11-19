# Optional system sounds

The live website uses owner-supplied XP login and logoff recordings. Those files
are not included in this public template because no redistribution licence was
provided. The MIT code licence does not grant rights to Windows recordings.

To enable sounds in your private deployment, provide audio you have permission
to use at `sounds/xp-login.mp3` and `sounds/xp-logoff.mp3`, then set
`SYSTEM_AUDIO_ENABLED=true` in `desktop.js`. The login sound also respects
`startupSound` in your profile. Both sounds respect the desktop volume and mute.
Restart waits for the logoff sound, with a bounded failure timeout.
