export type IndexableObject = {
	[key: string]: any;
};

export function omit<T>(object: IndexableObject, paths: string[]): T {
	const mutableObject = { ...object.toObject() };
	paths.forEach((key) => {
		if (mutableObject.hasOwnProperty(key)) delete mutableObject[key];
	});
	return mutableObject as T;
}
