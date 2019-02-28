# Meetings app for the Deaf

# What is it
This is a product which takes in what others are saying in a meeting and transcribe real-time using kaldi-asr. Users can save the transcript or copy it to their clipboard after they are done with the meeting. 

# Installation

## OS
Please use Ubuntu. If you try Windows, it can go horribly wrong (talking from previous experiences)

## Requirements
- [NodeJS]
- [npm]
- [docker (you can build kaldi on your own and make a server but it will take the semester to complete this)]

## Steps
1. Run the steps for building a kaldi server (Assuming you have docker installed): 
    1. `docker pull jcsilva/docker-kaldi-gstreamer-server`
    2. `mkdir /media/kaldi_models && cd /media/kaldi_models`
    3. `wget https://phon.ioc.ee/~tanela/tedlium_nnet_ms_sp_online.tgz`
    4. `tar -zxvf tedlium_nnet_ms_sp_online.tgz`
    5. `wget https://raw.githubusercontent.com/alumae/kaldi-gstreamer-server/master/sample_english_nnet2.yaml -P /media/kaldi_models`
    6. `find /media/kaldi_models/ -type f | xargs sed -i 's:test:/opt:g'`
    7. `sed -i 's:full-post-processor:#full-post-processor:g' /media/kaldi_models/sample_english_nnet2.yaml`
    8. `docker run -it -p 8080:80 -v /media/kaldi_models:/opt/models jcsilva/docker-kaldi-gstreamer-server:latest /bin/bash`
    9. `/opt/start.sh -y /opt/models/sample_english_nnet2.yaml`
    10. You have built the server and it is up and running with the steps 9-10. To stop the server, run `/opt/stop.sh` in your docker container. 
2. Run the steps for building the front-end (Assuming you have npm and nodejs installed): 
    1. `git clone https://github.com/SWEN-789/dhh-project-dkaushik95.git`
    2. `cd dhh-project-dkaushik95`
    3. `npm install`
    4. `npm start` or `npm run start`
    5. This should open a browser to the webpage. If it doesn't, go to `localhost:3000`
3. Once you are in the webpage:
    1. Press the `initialize microphone` button. This will ask your browser to allow the usage of a microphone. 
    2. Press the `Start meeting` button. This should start transcribing what you/others say. 
    3. When the meeting is done, press the `Stop meeting` button. It should give you an option to save the transcript as a txt file or copy it to the clipboard.

## Error cases

If you find any errors after you run it a couple of times, one of the reason could be that the worker is still trying to process the previous work. You should see the number of workers available in the webpage. For a quick fix, you may run the step 1.10 and then 1.9 in your docker and refresh the page. 