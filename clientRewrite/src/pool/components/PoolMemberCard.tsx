import { CardBase } from "../../common/components/cards/CardBase.tsx"
import { PoolMember } from "../../common/models/PoolMember.ts"
import { Icon } from "../../common/icons/Icon.tsx"
import { DeleteIconSvg } from "../../common/icons/svgs/DeleteIconSvg.tsx"
import { CollapseIconButton } from "../../common/components/CollapseIconButton.tsx"

interface PoolMemberParentExtraProps {
    setOpen: (open: boolean) => void
    open: boolean
}

interface PoolMemberCardProps {
    poolMember: PoolMember
    parentProps?: PoolMemberParentExtraProps
}

export const PoolMemberCard = ({ poolMember, parentProps }: PoolMemberCardProps) => {
    return (
        <CardBase isParent={!!parentProps}>
            {parentProps && <CollapseIconButton open={parentProps.open} setOpen={parentProps.setOpen} />}
            <img
                src={poolMember.spotify_icon_uri}
                alt={`Pool member ${poolMember.name} icon`}
                className="h-iconSize w-iconSize pointer-events-none select-none"
            />
            <p className="text-xs select-none">{poolMember.name}</p>
            <div className="grow"></div>
            <Icon svg={<DeleteIconSvg />} />
        </CardBase>
    )
}
