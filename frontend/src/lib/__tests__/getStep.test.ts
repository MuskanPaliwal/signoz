import dayjs from 'dayjs';
import getStep, { DefaultStepSize } from 'lib/getStep';

describe('lib/getStep', () => {
	test('should return default step when the given range is less than 1 day', () => {
		const start = dayjs();
		const end = start.add(1, 'hour');
		const startUnix = start.valueOf();
		const endUnix = end.valueOf();

		expect(
			getStep({
				start: startUnix / 1e3,
				end: endUnix / 1e3,
				inputFormat: 's',
			}),
		).toEqual(DefaultStepSize);

		expect(
			getStep({
				start: startUnix,
				end: endUnix,
				inputFormat: 'ms',
			}),
		).toEqual(DefaultStepSize);

		expect(
			getStep({
				start: startUnix * 1e6,
				end: endUnix * 1e6,
				inputFormat: 'ns',
			}),
		).toEqual(DefaultStepSize);
	});

	test('should return relevant step when the given range is greater than 1 day', () => {
		const start = dayjs();
		const end = start.add(1, 'Day').add(1, 'Second');
		const startUnix = start.valueOf();
		const endUnix = end.valueOf();

		const expectedStepSize = end.diff(start, 'days') * DefaultStepSize;
		expect(
			getStep({
				start: startUnix / 1e3,
				end: endUnix / 1e3,
				inputFormat: 's',
			}),
		).toEqual(expectedStepSize);

		expect(
			getStep({
				start: startUnix,
				end: endUnix,
				inputFormat: 'ms',
			}),
		).toEqual(expectedStepSize);

		expect(
			getStep({
				start: startUnix * 1e6,
				end: endUnix * 1e6,
				inputFormat: 'ns',
			}),
		).toEqual(expectedStepSize);
	});
});
