<script>
	import Icon from '@iconify/svelte'
	import { loadingSite } from '../../stores/app/misc'
	import UI from '../../ui'
</script>

<a class="primo-button" aria-label="See all sites" href="/admin/dashboard">
	<!-- <a class="primo-button" aria-label="See all sites" href="/"> -->
	{#if $loadingSite}
		<UI.Spinner />
	{:else}
		<Icon icon="mage:dashboard-fill" />
		<!-- <span>C</span> -->
		<!-- <svg viewBox="0 0 858 472" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clip-path="url(#clip0_101_106)">
				<path
					d="M293.093 471.893C282.303 471.893 271.513 467.838 263.386 459.59L12.4184 209.2C4.57129 201.371 0.0872192 190.606 0.0872192 179.562C0.0872192 168.517 4.57129 157.752 12.4184 149.923L146.1 16.5496C162.495 0.192488 189.119 0.192488 205.514 16.5496C221.908 32.9067 221.908 59.4696 205.514 75.8267L101.539 179.562L322.66 400.173C339.055 416.53 339.055 443.093 322.66 459.45C314.392 467.699 303.743 471.753 292.953 471.753L293.093 471.893Z"
					fill="url(#paint0_linear_101_106)"
				/>
				<path
					d="M682.086 354.876C671.296 354.876 660.506 350.822 652.379 342.574C635.984 326.216 635.984 299.654 652.379 283.296L756.353 179.562L652.379 75.8267C635.984 59.4696 635.984 32.9067 652.379 16.5496C668.774 0.192489 695.398 0.192489 711.793 16.5496L845.474 149.923C853.321 157.752 857.805 168.517 857.805 179.562C857.805 190.606 853.321 201.371 845.474 209.2L711.793 342.574C703.525 350.822 692.876 354.876 682.086 354.876Z"
					fill="#35D994"
				/>
				<path
					d="M293.093 471.893C269.832 471.893 251.055 453.159 251.055 429.951V178.443C251.055 80.4402 330.927 0.751709 429.016 0.751709C527.105 0.751709 607.118 80.4402 607.118 178.443C607.118 276.446 527.245 356.135 429.016 356.135C405.755 356.135 386.978 337.401 386.978 314.193C386.978 290.986 405.755 272.252 429.016 272.252C480.863 272.252 523.042 230.171 523.042 178.443C523.042 126.716 480.863 84.6344 429.016 84.6344C377.169 84.6344 334.991 126.716 334.991 178.443V429.951C334.991 453.159 316.214 471.893 292.953 471.893H293.093Z"
					fill="#35D994"
				/>
			</g>
			<defs>
				<linearGradient id="paint0_linear_101_106" x1="79.2591" y1="83.2363" x2="388.925" y2="393.617" gradientUnits="userSpaceOnUse">
					<stop stop-color="#35D994" />
					<stop offset="0.16" stop-color="#32D28E" />
					<stop offset="0.38" stop-color="#29BF80" />
					<stop offset="0.64" stop-color="#1CA169" />
					<stop offset="0.93" stop-color="#097649" />
					<stop offset="0.95" stop-color="#097548" />
				</linearGradient>
				<clipPath id="clip0_101_106">
					<rect width="857.718" height="471.141" fill="white" transform="translate(0.0872192 0.751709)" />
				</clipPath>
			</defs>
		</svg> -->
	{/if}
</a>

<style lang="postcss">
	.primo-button {
		/* aspect-ratio: 1; */
		color: white;
		padding: 0.25rem;
		border-radius: var(--primo-border-radius);
		display: block;
		height: 100%;
		background: var(--primo-color-codeblack);
		transition:
			background 0.1s,
			box-shadow 0.1s;
		width: 2rem;
		background-size: 2rem;
		background-repeat: no-repeat;
		background-position: center;
		outline: 0;
		display: flex;
		justify-content: center;
		align-items: center;

		&:hover {
			box-shadow: var(--primo-ring);
		}

		&:focus {
			box-shadow: var(--primo-ring-thin);
		}

		&:active {
			background: var(--color-gray-8);
		}
	}
</style>
