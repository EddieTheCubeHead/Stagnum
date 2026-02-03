import { CardBase } from "../../common/components/cards/CardBase.tsx"
import { PoolMember } from "../../common/models/PoolMember.ts"
import { DeleteIconSvg } from "../../common/icons/svgs/DeleteIconSvg.tsx"
import { CollapseIconButton } from "../../common/components/CollapseIconButton.tsx"
import { CardText } from "../../common/components/cards/CardText.tsx"
import { Size } from "../../common/constants/size.ts"
import { IconButton } from "../../common/icons/IconButton.tsx"
import { useDeletePoolContent } from "../hooks/useDeletePoolContent.ts"
import { PromotePoolTrackIconButton } from "./PromotePoolTrackIconButton.tsx"

interface PoolMemberParentExtraProps {
    setOpen: (open: boolean) => void
    open: boolean
}

interface PoolMemberCardProps {
    poolMember: PoolMember
    parentProps?: PoolMemberParentExtraProps
    isTopLevel?: boolean
}

export const PoolMemberCard = ({ poolMember, parentProps, isTopLevel }: PoolMemberCardProps) => {
    const deleteFromPool = useDeletePoolContent(poolMember)
    return (
        <CardBase isTopLevel={isTopLevel}>
            {parentProps && (
                <CollapseIconButton open={parentProps.open} setOpen={parentProps.setOpen} category={poolMember.name} />
            )}
            <img
                src={poolMember.spotify_icon_uri}
                alt={`Pool member ${poolMember.name} icon`}
                className="h-iconSize w-iconSize pointer-events-none select-none"
            />
            <CardText title={poolMember.name} text={poolMember.name} size={Size.s} />
            <div className="grow"></div>
            <PromotePoolTrackIconButton poolMember={poolMember} />
            <IconButton svg={<DeleteIconSvg />} onClick={deleteFromPool} />
        </CardBase>
    )
}
