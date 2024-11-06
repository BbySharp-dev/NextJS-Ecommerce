// ** React Imports
import { useState, SyntheticEvent, Fragment, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled, Theme, useTheme } from '@mui/material/styles'
import MuiMenu, { MenuProps } from '@mui/material/Menu'
import MuiMenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { Chip } from '@mui/material'

// ** Components
import Icon from 'src/components/Icon'
import NotificationItem from 'src/views/layouts/components/notification-dropdown/components/NotificationItem'

// ** Third party
import { useTranslation } from 'react-i18next'
import { getMessaging, onMessage } from 'firebase/messaging'

// ** Store
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/stores'
import { getAllNotificationsAsync, markReadAllNotificationAsync } from 'src/stores/notification/actions'
import toast from 'react-hot-toast'
import { resetInitialState } from 'src/stores/notification'

// ** Configs
import firebaseApp from 'src/configs/firebase'

// ** Hooks
import useFcmToken from 'src/hooks/useFcmToken'

// ** Services
import { updateDeviceToken } from 'src/services/auth'

// ** Helpers
import { clearLocalDeviceToken, getLocalDeviceToken, setLocalDeviceToken } from 'src/helpers/storage'

export type NotificationsType = {
    createdAt: string
    _id: string
    title: string
    body: string
    isRead: boolean
    referenceId: string
    context: string
}

interface Props {
}

// ** Styled Menu component
const Menu = styled(MuiMenu)<MenuProps>(({ theme }) => ({
    '& .MuiMenu-paper': {
        width: 380,
        overflow: 'hidden',
        marginTop: theme.spacing(4.25),
        [theme.breakpoints.down('sm')]: {
            width: '100%'
        }
    },
    '& .MuiMenu-list': {
        padding: 0,
        '& .MuiMenuItem-root': {
            margin: 0,
            borderRadius: 0,
            padding: theme.spacing(4, 6),
            '&:hover': {
                backgroundColor: theme.palette.action.hover
            }
        }
    }
}))

// ** Styled MenuItem component
const MenuItem = styled(MuiMenuItem)<MenuItemProps>(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    '&:not(:last-of-type)': {
        borderBottom: `1px solid ${theme.palette.divider}`
    }
}))


const NotificationDropdown = (props: Props) => {

    // ** Hooks
    const theme = useTheme()
    const { t } = useTranslation()
    const { fcmToken } = useFcmToken();

    // ** Ref
    const wrapperListRef = useRef<HTMLDivElement>(null)

    // ** Redux
    const dispatch: AppDispatch = useDispatch()
    const {
        notifications, isSuccessDelete, isSuccessRead,
        isErrorDelete, isErrorRead, messageErrorDelete, messageErrorRead
        , isSuccessReadAll, isErrorReadAll, messageErrorReadAll
    } = useSelector((state: RootState) => state.notification)


    // ** States
    const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(null)
    const [limit, setLimit] = useState(10)
    const localDeviceToken = getLocalDeviceToken()

    // ** handle
    const handleDropdownOpen = (event: SyntheticEvent) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMarkReadAllNotification = () => {
        dispatch(markReadAllNotificationAsync())
    }

    const handleDropdownClose = () => {
        setAnchorEl(null)
    }

    const handleGetListNotification = () => {
        dispatch(getAllNotificationsAsync({ params: { limit: limit, page: 1, order: "createdAt desc" } }))
    }

    const handleUpdateDeviceToken = async (token:string) => {
        clearLocalDeviceToken()
        setLocalDeviceToken(token)
        await updateDeviceToken({deviceToken: token})
    }

    const handleScrollListNotification = () => {
        const wrapperContent = wrapperListRef.current
        if (!wrapperContent) {
            return
        }
        const heightList = wrapperContent.clientHeight
        const scrollHeight = wrapperContent.scrollHeight
        const maxScroll = scrollHeight - heightList
        const currentScroll = wrapperContent.scrollTop
        if (currentScroll >= maxScroll) {
            if (notifications.total > limit) {
                setLimit((prev) => prev + 10)
            }
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const messaging = getMessaging(firebaseApp);
            const unsubscribe = onMessage(messaging, (payload) => {
                handleGetListNotification()
            });

            return () => {
                unsubscribe(); // Unsubscribe from the onMessage event
            };
        }
    }, []);

    useEffect(() => {
        if(fcmToken !== localDeviceToken) {
            handleUpdateDeviceToken(fcmToken)
        }
    }, [fcmToken])

    useEffect(() => {
        handleGetListNotification()
    }, [limit])

    useEffect(() => {
        if (isSuccessRead && !isErrorRead) {
            toast.success(t("Marked_notification_success"))
            dispatch(resetInitialState())
            handleGetListNotification()
        } else if (isErrorRead && messageErrorRead) {
            toast.error(t("Marked_notification_failed"))
            dispatch(resetInitialState())
        }
    }, [isSuccessRead, isErrorRead, messageErrorRead])

    useEffect(() => {
        if (isSuccessDelete && !isErrorDelete) {
            toast.success(t("Delete_notification_success"))
            dispatch(resetInitialState())
            handleGetListNotification()
        } else if (isErrorDelete && messageErrorDelete) {
            toast.error(t("Delete_notification_failed"))
            dispatch(resetInitialState())
        }
    }, [isSuccessDelete, isErrorDelete, messageErrorDelete])

    useEffect(() => {
        if (isSuccessReadAll && !isErrorReadAll) {
            toast.success(t("Marked_all_notification_success"))
            dispatch(resetInitialState())
            handleGetListNotification()
        } else if (isErrorReadAll && messageErrorReadAll) {
            toast.error(t("Marked_all_notification_failed"))
            dispatch(resetInitialState())
        }
    }, [isSuccessReadAll, isSuccessReadAll, messageErrorReadAll])

    return (
        <Fragment>
            <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
                <Badge
                    color='error'
                    badgeContent={notifications.totalNew}
                    sx={{
                        '& .MuiBadge-badge': { top: 4, right: 4, boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}` }
                    }}
                >
                    <Icon fontSize='1.625rem' icon='tabler:bell' />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleDropdownClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem
                    disableRipple
                    disableTouchRipple
                    sx={{ cursor: 'default', userSelect: 'auto', backgroundColor: 'transparent !important' }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography variant='h5' sx={{ cursor: 'text' }}>
                            {t("Notifications")}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <Chip
                                size='small'
                                color='primary'
                                label={`${notifications.totalNew} New`}
                            />
                            <Icon icon="line-md:email-opened"></Icon>
                        </Box>
                    </Box>
                </MenuItem>
                <Box
                    sx={{
                        maxHeight: 349, overflowY: 'auto', overflowX: 'hidden'
                    }}
                    ref={wrapperListRef}
                    onScroll={handleScrollListNotification}
                >
                    {notifications?.data?.map((notification: NotificationsType, index: number) => (
                        <NotificationItem
                            key={index}
                            notification={notification}
                            handleDropdownClose={handleDropdownClose}
                        />
                    ))}
                </Box>
                <MenuItem
                    disableRipple
                    disableTouchRipple
                    sx={{
                        borderBottom: 0,
                        cursor: 'default',
                        userSelect: 'auto',
                        backgroundColor: `${theme.palette.background.paper} !important`,
                        borderTop: theme => `1px solid ${theme.palette.divider}`
                    }}
                >
                    <Button fullWidth variant='contained' onClick={handleMarkReadAllNotification}>
                        {t("Mark read all notifications")}
                    </Button>
                </MenuItem>
            </Menu>
        </Fragment>
    )
}

export default NotificationDropdown
