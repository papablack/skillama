#!/bin/bash

# Colors for output to make it more readable
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Let's start the installation!${NC}"

# Update packages
echo -e "\n${GREEN}Updating packages...${NC}"
pkg update -y && pkg upgrade -y

# Install proot-distro
echo -e "\n${GREEN}Installing proot-distro...${NC}"
pkg install proot-distro -y

# Install Ubuntu
echo -e "\n${GREEN}Installing Ubuntu (this may take a while, be patient)...${NC}"
proot-distro install ubuntu

# Create aliases in .bashrc
echo -e "\n${GREEN}Adding aliases to .bashrc...${NC}"
cat >> ~/.bashrc << 'EOL'

# Ubuntu aliases
alias ubuntu='proot-distro login ubuntu --bind /data/data/com.termux/files/home:/home/termux'
alias ubuntu-run='proot-distro login ubuntu --bind /data/data/com.termux/files/home:/home/termux -- '
EOL

# First Ubuntu launch to create .bashrc
echo -e "\n${GREEN}Configuring Ubuntu...${NC}"
proot-distro login ubuntu --bind /data/data/com.termux/files/home:/home/termux -- bash -c 'echo "cd /home/termux" >> ~/.bashrc'
proot-distro login ubuntu --bind /data/data/com.termux/files/home:/home/termux -- bash -c 'apt update -y && apt install -y nano htop wget curl net-tools nodejs && npm install -g yarn && curl -fsSL https://bun.sh/install | bash'
# Load new .bashrc
source ~/.bashrc

echo -e "\n${GREEN}Great, all done!${NC}"
echo -e "${GREEN}Now you can use:${NC}"
echo -e "  ${RED}ubuntu${NC} - to enter Ubuntu"
echo -e "  ${RED}ubuntu-run 'command'${NC} - to run a command in Ubuntu"
echo -e "\nExample: ${RED}ubuntu-run 'ls /home/termux'${NC}"
