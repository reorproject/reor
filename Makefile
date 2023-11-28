get-latest-tag:
	git describe --tags --abbrev=0

version-bump-patch:
	make version-bump type=patch

version-bump-minor:
	make version-bump type=minor

version-bump-major:
	make version-bump type=major

fetch-tags:
	git fetch --all --tags

version-bump: fetch-tags
	[ "${type}" ] || ( echo "'type' not provided [patch, minor, major]"; exit 1 )
	bump2version --current-version $(shell git describe --tags --abbrev=0) ${type} --list --tag --serialize v{major}.{minor}.{patch} --tag-name {new_version}  | grep new_version | sed -r s,"^.*=",, | xargs git push origin
