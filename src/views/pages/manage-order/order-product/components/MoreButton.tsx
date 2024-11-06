import { IconButton, Menu, MenuItem } from "@mui/material"
import { MouseEvent, useState } from "react"
import { useDispatch } from "react-redux"
import Icon from "src/components/Icon"
import { AppDispatch } from "src/stores"
import { updateStatusOrderProductAsync } from "src/stores/order-product/actions"
import { TParamsStatusOrderUpdate } from "src/types/order-product"

type TProps = {
    memoOptionStatus: { label: string, value: string }[]
    data: any
}

const MoreButton = ({ memoOptionStatus, data }: TProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const dispatch: AppDispatch = useDispatch()

    const optionsOpen = Boolean(anchorEl)

    const handleOptionsClose = () => {
        setAnchorEl(null)
    }

    const handleUpdateStatusOrder = (data: TParamsStatusOrderUpdate) => {
        dispatch(updateStatusOrderProductAsync(data))
    }

    return (
        <>
            <IconButton onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}>
                <Icon icon="pepicons-pencil:dots-y"></Icon>
            </IconButton>
            <Menu
                keepMounted
                anchorEl={anchorEl}
                open={optionsOpen}
                onClose={handleOptionsClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
            >
                {memoOptionStatus?.map((item) => {

                    return (
                        <MenuItem
                            key={item.value}
                            sx={{ '& svg': { mr: 2 } }}
                            onClick={() => {
                                handleUpdateStatusOrder({
                                    id: data._id,
                                    status: +item.value
                                })
                                handleOptionsClose()
                            }}
                        >
                            {item.label}
                        </MenuItem>
                    )
                })}
            </Menu>
        </>
    )
}

export default MoreButton