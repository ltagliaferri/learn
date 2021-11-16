import { ReactNode, forwardRef } from 'react'

import { StyledCardLink } from './CardLinkStyles'

interface Props {
    children?: ReactNode
    href?: string
    setHeight?: boolean
}

const CardLink = forwardRef<HTMLAnchorElement, Props>((props, reference) => (
    <StyledCardLink
        setHeight={props.setHeight}
        href={props.href}
        ref={reference}>
        {props.children}
    </StyledCardLink>
))

export default CardLink
