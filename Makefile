SHELL := /bin/zsh

.DEFAULT_GOAL := help

.PHONY: help install dev build preview clean reinstall

help:
	@printf "Available targets:\n"
	@printf "  make install    Install dependencies\n"
	@printf "  make dev        Start the Vite dev server\n"
	@printf "  make build      Create a production build\n"
	@printf "  make preview    Preview the production build locally\n"
	@printf "  make clean      Remove build output\n"
	@printf "  make reinstall  Reinstall dependencies from scratch\n"

install:
	npm install

dev:
	npm run dev -- --host

build:
	npm run build

preview:
	npm run preview -- --host

clean:
	rm -rf dist

reinstall:
	rm -rf node_modules package-lock.json
	npm install
