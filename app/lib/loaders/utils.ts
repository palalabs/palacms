export const paramsMatch = <T extends (string | number | undefined | null)[]>(array1: [...T], array2: [...T]) => {
	if (array1.length != array2.length) {
		return false
	}

	for (let index = 0; index < array1.length; index++) {
		if (array1[index] !== array2[index]) {
			return false
		}
	}

	return true
}
