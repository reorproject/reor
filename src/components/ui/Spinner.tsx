import React from 'react'
import { Spinner as TamaguiSpinner, SpinnerProps } from 'tamagui'

/**
 * Spinner component that wraps the Tamagui Spinner for consistent usage across the app.
 * 
 * @example
 * ```
 * <Spinner size="large" color="$colorPrimary" />
 * ```
 */
const Spinner: React.FC<SpinnerProps> = (props) => {
    // @ts-ignore eslint-disable-next-line
    return <TamaguiSpinner {...props} />
}

export default Spinner