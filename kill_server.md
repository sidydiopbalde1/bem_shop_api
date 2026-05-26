sudo lsof -i :3000


Tu verras quelque chose comme :

node    12345 user   23u  IPv6  ... TCP *:3000 (LISTEN)


Arrêter le processus
kill -9 12345

Remplace 12345 par le PID obtenu.