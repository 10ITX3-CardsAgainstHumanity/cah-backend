# cah-backend

## Local development
You need connect to the developmentCloud Memorystore (Redis) Server.
For this open a ssh tunnel to a vm machine inside the default network on GCP.

```
gcloud compute ssh [VM MACHINE NAME] -- -N -L [MEMORYSTORE PORT]:[MEMORYSTORE HOST]:[MEMORYSTORE PORT]
``` 