/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export const appStyle = css`
	position: relative;
	min-height: 100vh;
	overflow: hidden;
`;

export const backgroundStyle = css`
	position: fixed;
	inset: -80px;
	background-image: linear-gradient(rgba(0, 0, 0, 0.18), rgba(23, 92, 221, 0.453)),
		url(/background.jpg);
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	filter: blur(50px);
	z-index: 0;
	pointer-events: none;
`;

export const contentStyle = css`
	position: relative;
	z-index: 1;
	padding-left: 0;
	padding-top: 0;
`;

export const savedPatternPanelStyle = css`
	position: fixed;
	right: 16px;
	top: 50%;
	transform: translateY(-50%);
	z-index: 5;
	pointer-events: auto;
	width: 320px;
	height: 100vh;
`;
