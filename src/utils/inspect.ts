/**
 * Logs a value with an optional label and returns the value unchanged.
 * A specialized version of `tap` for debugging that automatically logs to console.
 *
 * @param label - Optional label to prefix the logged value
 * @returns A function that takes a value, logs it, and returns it unchanged
 *
 * @example
 * ```ts
 * // Basic usage
 * pipe(
 *   just(42),
 *   map(x => x * 2),
 *   inspect('After doubling'),  // Logs: "After doubling: 84"
 *   map(x => x + 10)
 * );
 *
 * // Without label
 * pipe(
 *   ok({ id: 1, name: 'Alice' }),
 *   inspect(),  // Logs: { id: 1, name: 'Alice' }
 *   map(user => user.name)
 * );
 *
 * // Debugging array operations
 * pipe(
 *   [1, 2, 3, 4],
 *   inspect('Initial array'),
 *   arr => arr.filter(x => x > 2),
 *   inspect('After filter'),
 *   arr => arr.map(x => x * 2),
 *   inspect('Final result')
 * );
 *
 * // With Either
 * pipe(
 *   right<string, number>(42),
 *   inspect('Right value'),
 *   map(x => x * 2)
 * );
 * ```
 */
export function inspect<T>(label?: string) {
	return (value: T): T => {
		if (label) {
			console.log(`${label}:`, value);
		} else {
			console.log(value);
		}
		return value;
	};
}
