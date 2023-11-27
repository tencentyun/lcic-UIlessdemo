# echo 安装nvm
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash

# source ~/.bashrc



# nvm install 20
 
# use 20

# echo $(node -v)

# npm i

# npm run build

# PATH="¥"
echo $NVM_DIR

if [ $NVM_DIR ]; then
    source ~/.bashrc
    echo "nvm has installed"
    nvm use 20
    echo $(node -v)
else
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
    source ~/.bashrc
    nvm install 20
    nvm use 20
    echo $(node -v)
fi

# echo $NVM

# if command -v nvm >/dev/null 2>&1;  then
#     echo "nvm is installed"
# else
#     echo "nvm is not installed"
# fi