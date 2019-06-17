NAME = CryptoModule

$(NAME):
	@npm install
	@echo "\033[32;01mDependencies installed  successfully!"

start:
	@npm run start source/index.js

build:
	@rm -rf dist
	@echo "\033[31mRemove dist folder\033[0m"
	@npm run build
	@echo "\033[32;01mBuild done\033[0m"

lint:
	@echo "\033[32;01mStart linter!"
	@npm run lint

clean:
	@rm -rf node_modules
	@echo "\033[31mRemove node_modules\033[0m"
	@rm -rf dist
	@echo "\033[31mRemove dist folder\033[0m"
