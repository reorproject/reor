import React from 'react'
import { ActionIcon } from '@mantine/core'

const SideMenuButton = (props: { children: JSX.Element }) => <ActionIcon size={24}>{props.children}</ActionIcon>

export default SideMenuButton
