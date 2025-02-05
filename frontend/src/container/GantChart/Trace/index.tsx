import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons';
import { Col } from 'antd';
import { StyledCol, StyledRow } from 'components/Styled';
import { IIntervalUnit } from 'container/TraceDetail/utils';
import useThemeMode from 'hooks/useThemeMode';
import { SPAN_DETAILS_LEFT_COL_WIDTH } from 'pages/TraceDetail/constants';
import React, { useEffect, useRef, useState } from 'react';
import { pushDStree } from 'store/actions';

import { ITraceMetaData } from '..';
import SpanLength from '../SpanLength';
import SpanName from '../SpanName';
import { getMetaDataFromSpanTree, getTopLeftFromBody } from '../utils';
import {
	CardComponent,
	CardContainer,
	CaretContainer,
	HoverCard,
	styles,
	Wrapper,
} from './styles';

function Trace(props: TraceProps): JSX.Element {
	const {
		name,
		activeHoverId,
		setActiveHoverId,
		globalSpread,
		globalStart,
		serviceName,
		startTime,
		value,
		serviceColour,
		id,
		setActiveSelectedId,
		activeSelectedId,
		level,
		activeSpanPath,
		isExpandAll,
		intervalUnit,
	} = props;

	const { isDarkMode } = useThemeMode();
	const [isOpen, setOpen] = useState<boolean>(activeSpanPath[level] === id);

	const localTreeExpandInteraction = useRef<boolean | 0>(0); // Boolean is for the state of the expansion whereas the number i.e. 0 is for skipping the user interaction.

	useEffect(() => {
		if (localTreeExpandInteraction.current !== 0) {
			setOpen(localTreeExpandInteraction.current);
			localTreeExpandInteraction.current = 0;
		} else if (!isOpen) {
			setOpen(activeSpanPath[level] === id);
		}
	}, [activeSpanPath, isOpen]);

	useEffect(() => {
		if (isExpandAll) {
			setOpen(isExpandAll);
		} else {
			setOpen(activeSpanPath[level] === id);
		}
	}, [isExpandAll]);

	const isOnlyChild = props.children.length === 1;
	const [top, setTop] = useState<number>(0);

	const ref = useRef<HTMLUListElement>(null);

	React.useEffect(() => {
		if (activeSelectedId === id) {
			ref.current?.scrollIntoView({
				block: 'nearest',
				behavior: 'auto',
				inline: 'nearest',
			});
		}
	}, [activeSelectedId]);

	const onMouseEnterHandler = () => {
		setActiveHoverId(props.id);
		if (ref.current) {
			const { top } = getTopLeftFromBody(ref.current);
			setTop(top);
		}
	};

	const onMouseLeaveHandler = () => {
		setActiveHoverId('');
	};

	const onClick = () => {
		setActiveSelectedId(id);
	};

	const onClickTreeExpansion = (event) => {
		event.stopPropagation();
		setOpen((state) => {
			localTreeExpandInteraction.current = !isOpen;
			return !state;
		});
	};
	const { totalSpans } = getMetaDataFromSpanTree(props);

	const inMsCount = value;
	const nodeLeftOffset = ((startTime - globalStart) * 1e2) / globalSpread;
	const width = (value * 1e2) / (globalSpread * 1e6);
	const panelWidth = SPAN_DETAILS_LEFT_COL_WIDTH - level * (16 + 1) - 48;

	return (
		<Wrapper
			onMouseEnter={onMouseEnterHandler}
			onMouseLeave={onMouseLeaveHandler}
			isOnlyChild={isOnlyChild}
			ref={ref}
		>
			<HoverCard
				top={top}
				isHovered={activeHoverId === id}
				isSelected={activeSelectedId === id}
				isDarkMode={isDarkMode}
			/>

			<CardContainer onClick={onClick}>
				<StyledCol flex={`${panelWidth}px`} styledclass={[styles.overFlowHidden]}>
					<StyledRow styledclass={[styles.flexNoWrap]}>
						<Col>
							{totalSpans !== 1 && (
								<CardComponent isDarkMode={isDarkMode} onClick={onClickTreeExpansion}>
									{totalSpans}
									<CaretContainer>
										{isOpen ? <CaretDownFilled /> : <CaretRightFilled />}
									</CaretContainer>
								</CardComponent>
							)}
						</Col>
						<Col>
							<SpanName name={name} serviceName={serviceName} />
						</Col>
					</StyledRow>
				</StyledCol>
				<Col flex="1">
					<SpanLength
						leftOffset={nodeLeftOffset.toString()}
						width={width.toString()}
						bgColor={serviceColour}
						id={id}
						inMsCount={inMsCount / 1e6}
						intervalUnit={intervalUnit}
					/>
				</Col>
			</CardContainer>

			{isOpen && (
				<>
					{props.children.map((child) => (
						<Trace
							key={child.id}
							activeHoverId={props.activeHoverId}
							setActiveHoverId={props.setActiveHoverId}
							{...child}
							globalSpread={globalSpread}
							globalStart={globalStart}
							setActiveSelectedId={setActiveSelectedId}
							activeSelectedId={activeSelectedId}
							level={level + 1}
							activeSpanPath={activeSpanPath}
							isExpandAll={isExpandAll}
							intervalUnit={intervalUnit}
						/>
					))}
				</>
			)}
		</Wrapper>
	);
}

interface ITraceGlobal {
	globalSpread: ITraceMetaData['spread'];
	globalStart: ITraceMetaData['globalStart'];
}

interface TraceProps extends pushDStree, ITraceGlobal {
	activeHoverId: string;
	setActiveHoverId: React.Dispatch<React.SetStateAction<string>>;
	setActiveSelectedId: React.Dispatch<React.SetStateAction<string>>;
	activeSelectedId: string;
	level: number;
	activeSpanPath: string[];
	isExpandAll: boolean;
	intervalUnit: IIntervalUnit;
}

export default Trace;
