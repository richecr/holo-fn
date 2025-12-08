/**
 * Executes a side-effect function and returns the original value unchanged.
 * Useful for debugging, logging, or performing side-effects in functional pipelines.
 *
 * @param fn - A function that receives the value and performs a side-effect
 * @returns A function that takes a value, executes the side-effect, and returns the value
 *
 * @example
 * ```ts
 * pipe(
 *   just(42),
 *   tap(x => console.log('Value:', x)),
 *   map(x => x * 2)
 * );
 *
 * pipe(
 *   [1, 2, 3],
 *   tap(arr => console.log('Array:', arr)),
 *   arr => arr.map(x => x * 2)
 * );
 * ```
 */
export function tap<T>(fn: (value: T) => void) {
	return (value: T): T => {
		fn(value);
		return value;
	};
}
