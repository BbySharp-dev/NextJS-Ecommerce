// ** Next
import { NextPage } from 'next'

// ** React
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// ** Mui
import { Box, Button, Grid, useTheme } from '@mui/material'
import { GridColDef, GridRowClassNameParams, GridSortModel } from '@mui/x-data-grid'

// ** Components
import GridDelete from 'src/components/grid-delete'
import GridEdit from 'src/components/grid-edit'
import GridCreate from 'src/components/grid-create'
import InputSearch from 'src/components/input-search'
import CreateEditRole from 'src/views/pages/system/role/component/CreateEditRole'
import CustomDataGrid from 'src/components/custom-data-grid'
import Spinner from 'src/components/spinner'
import TablePermission from 'src/views/pages/system/role/component/TablePermission'
import ConfirmationDialog from 'src/components/confirmation-dialog'
import Icon from 'src/components/Icon'

// ** Services
import { deleteRole, getAllRoles, getDetailsRole, updateRole } from 'src/services/role'

// ** Others
import toast from 'react-hot-toast'
import { PERMISSIONS } from 'src/configs/permission'
import { getAllValueOfObject } from 'src/utils'
import { hexToRGBA } from 'src/utils/hex-to-rgba'

// ** Hooks
import { usePermission } from 'src/hooks/usePermission'
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from 'src/configs/queryKey'
import { TParamsEditRole } from 'src/types/role'
import { useGetListRoles, useMutationEditRole } from 'src/queries/role'

type TProps = {}

const RoleListPage: NextPage<TProps> = () => {

  // State

  const [openCreateEdit, setOpenCreateEdit] = useState({
    open: false,
    id: ''
  })
  const [openDeleteRole, setOpenDeleteRole] = useState({
    open: false,
    id: ''
  })
  const [sortBy, setSortBy] = useState('created asc')
  const [searchBy, setSearchBy] = useState('')
  const [permissionSelected, setPermissionSelected] = useState<string[]>([])
  const [selectedRow, setSelectedRow] = useState({
    id: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [isDisablePermission, setIsDisabledPermission] = useState(false)

  // ** Query
  const queryClient = useQueryClient()

  // ** Permission
  const { VIEW, UPDATE, DELETE, CREATE } = usePermission('SYSTEM.ROLE', ['CREATE', 'VIEW', 'UPDATE', 'DELETE'])

  // ** Translate
  const { t } = useTranslation()

  // ** Ref
  const refActionGrid = useRef<boolean>(false)

  // ** theme
  const theme = useTheme()

  // fetch api

  const fetchDeleteRole = async (id: string) => {
    const res = await deleteRole(id)

    return res?.data
  }

  const {
    isPending: isLoadingEdit,
    mutate: mutateEditRole,
  } = useMutationEditRole({
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [queryKeys.role_list, sortBy, searchBy, -1, -1] })
      toast.success(t('Update_role_success'))
    },
    onError: () => {
      toast.success(t('Update_role_error'))
    },
  })

  const handleUpdateRole = () => {
    mutateEditRole({ name: selectedRow.name, id: selectedRow.id, permissions: permissionSelected })
  }

  const {
    data: rolesList,
    isPending
  } = useGetListRoles(
    { limit: -1, page: -1, search: searchBy, order: sortBy },
    {
      select: (data) => data?.roles,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 10000
    }
  )

  const {
    isPending: isLoadingDelete,
    mutate: mutateDeleteRole,
  } = useMutation({
    mutationFn: fetchDeleteRole,
    mutationKey: [queryKeys.delete_role],
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [queryKeys.role_list, sortBy, searchBy, -1, -1] })
      handleCloseConfirmDeleteRole()
      toast.success(t('Delete_role_success'))
    },
    onError: () => {
      toast.success(t('Delete_role_error'))
    },
  })

  // handle
  const handleCloseConfirmDeleteRole = useCallback(() => {
    setOpenDeleteRole({
      open: false,
      id: ''
    })
    refActionGrid.current = false
  }, [])

  const handleSort = (sort: GridSortModel) => {
    const sortOption = sort[0]
    setSortBy(`${sortOption.field} ${sortOption.sort}`)
  }

  const handleCloseCreateEdit = useCallback(() => {
    setOpenCreateEdit({
      open: false,
      id: ''
    })
    refActionGrid.current = false
  }, [])

  const handleDeleteRole = useCallback(() => {
    mutateDeleteRole(openDeleteRole.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDeleteRole.id])

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('Name'),
      flex: 1
    },
    {
      field: 'action',
      headerName: t('Actions'),
      minWidth: 150,
      sortable: false,
      align: 'left',
      renderCell: params => {
        const { row } = params

        return (
          <Box sx={{ width: '100%' }}>
            {!row?.permissions?.some((per: string) => ['ADMIN.GRANTED', 'BASIC.PUBLIC']?.includes(per)) ? (
              <>
                <GridEdit
                  disabled={!UPDATE}
                  onClick={() => {
                    refActionGrid.current = true
                    setOpenCreateEdit({
                      open: true,
                      id: String(params.id)
                    })
                  }
                  }
                />
                <GridDelete
                  disabled={!DELETE}
                  onClick={() => {
                    refActionGrid.current = true
                    setOpenDeleteRole({
                      open: true,
                      id: String(params.id)
                    })
                  }

                  }
                />
              </>
            ) : (
              <Icon icon='material-symbols-light:lock-outline' fontSize={30} />
            )}
          </Box>
        )
      }
    }
  ]

  // fetch api
  const handleGetDetailsRole = async (id: string) => {
    setLoading(true)
    await getDetailsRole(id)
      .then(res => {
        if (res?.data) {
          if (res?.data.permissions.includes(PERMISSIONS.ADMIN)) {
            setIsDisabledPermission(true)
            setPermissionSelected(getAllValueOfObject(PERMISSIONS, [PERMISSIONS.ADMIN, PERMISSIONS.BASIC]))
          } else if (res?.data.permissions.includes(PERMISSIONS.BASIC)) {
            setIsDisabledPermission(true)
            setPermissionSelected((PERMISSIONS as any)?.DASHBOARD)
          } else {
            setIsDisabledPermission(false)
            setPermissionSelected(res?.data?.permissions || [])
          }
        }
        setLoading(false)
      })
      .catch(e => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (selectedRow.id) {
      handleGetDetailsRole(selectedRow.id)
    }
  }, [selectedRow])

  return (
    <>
      {(isLoadingEdit || isPending || isLoadingDelete || loading) && <Spinner />}
      <ConfirmationDialog
        open={openDeleteRole.open}
        handleClose={handleCloseConfirmDeleteRole}
        handleCancel={handleCloseConfirmDeleteRole}
        handleConfirm={handleDeleteRole}
        title={t('Title_delete_role')}
        description={t('Confirm_delete_role')}
      />
      <CreateEditRole
        open={openCreateEdit.open}
        searchBy={searchBy}
        sortBy={sortBy}
        onClose={handleCloseCreateEdit}
        idRole={openCreateEdit.id}
      />
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          padding: '20px',
          height: '100%',
          width: '100%',
          borderRadius: '15px'
        }}
      >
        <Grid container sx={{ height: '100%', width: '100%' }}>
          <Grid item md={4} xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Box sx={{ width: '200px' }}>
                <InputSearch value={searchBy} onChange={(value: string) => setSearchBy(value)} />
              </Box>
              <GridCreate
                disabled={!CREATE}
                onClick={() => {
                  setOpenCreateEdit({
                    open: true,
                    id: ''
                  })
                }}
              />
            </Box>
            <Box sx={{ maxHeight: '100%' }}>
              <CustomDataGrid
                rows={rolesList || []}
                columns={columns}
                pageSizeOptions={[5]}
                autoHeight
                sx={{
                  '.row-selected': {
                    backgroundColor: `${hexToRGBA(theme.palette.primary.main, 0.08)} !important`,
                    color: `${theme.palette.primary.main} !important`
                  }
                }}
                hideFooter
                sortingOrder={['desc', 'asc']}
                sortingMode='server'
                onSortModelChange={handleSort}
                getRowId={row => row._id}
                disableRowSelectionOnClick
                getRowClassName={(row: GridRowClassNameParams) => {
                  return row.id === selectedRow.id ? 'row-selected' : ''
                }}
                onRowClick={row => {
                  if (!refActionGrid.current) {
                    setSelectedRow({ id: String(row.id), name: row?.row?.name })
                  }
                }}
                disableColumnFilter
              />
            </Box>
          </Grid>
          <Grid
            item
            md={8}
            xs={12}
            sx={{ maxHeight: '100%' }}
            paddingLeft={{ md: '40px', xs: '0' }}
            paddingTop={{ md: '0px', xs: '20px' }}
          >
            {selectedRow?.id && (
              <>
                <Box sx={{ height: 'calc(100% - 40px)' }}>
                  <TablePermission
                    setPermissionSelected={setPermissionSelected}
                    permissionSelected={permissionSelected}
                    disabled={isDisablePermission}
                  />
                </Box>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button disabled={isDisablePermission} variant='contained' sx={{ mt: 3 }} onClick={handleUpdateRole}>
                    {t('Update')}
                  </Button>
                </Box>
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default RoleListPage
