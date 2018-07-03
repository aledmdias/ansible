#!/bin/bash
sudo sed -i.bak 's/Port 22/Port 5022/' /etc/ssh/sshd_config
sudo service ssh restart

