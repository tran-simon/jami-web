# Jami-web

Jami-web is a web server that starts a Dameon on NodeJS express server and serve a React web client.

The first milestone is to allow user with LDAP credentials to connect to the account using JAMS service and start chatting with their contacts using instant messaging.

Next step will be to implement a video protocol such as WebRTC to allow audio and video calls from the users browser to another Jami contact allowing crossplateform communications.

# Main dependencies

* Jami Deamon with NodeJS bindings (https://review.jami.net/admin/repos/ring-daemon),
* NodeJS v14+

# How to start the server

After building the Jami daemon you can use the following command to start the node js server using the LD_LIBRARY_PATH

Where $PATH_TO_JAMI_PROJECT is the path to the shared library of your Jami daemon

LD_LIBRARY_PATH=$PATH_TO_JAMI_PROJECT/ring-project/install/daemon/lib node

To build the dring.node Javascript interface to talk to the daemon api go to the daemon repo and use ./configure --with-nodejs then execute make -j4 to build the daemon
