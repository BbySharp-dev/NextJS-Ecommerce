import { Box, useTheme } from "@mui/material"
import { TCountProductType } from "src/views/pages/dashboard"

import { Bar } from "react-chartjs-2";
import 'chart.js/auto';
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface TProps {
    data: TCountProductType[]
}

const CardProductType = (props: TProps) => {

    // Props
    const { data } = props

    const theme = useTheme()
    const {t} =useTranslation()

    const labelsMemo = useMemo(() => {
        return data?.map((item) => item?.typeName)
    }, [data])

    const dataMemo = useMemo(() => {
        return data?.map((item, index) => {
            return item?.total
        })
    }, [data])
    const dataSets = [
        {
            label: `${t("Số lượng")}`,
            backgroundColor: [
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.success.main,
                theme.palette.error.main,
                theme.palette.warning.main,
                theme.palette.secondary.main,
            ],
            data: dataMemo
        }
    ]

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.paper,
                padding: '20px',
                height: '400px',
                width: '100%',
                borderRadius: '15px',
                mt: 4,
                "canvas": {
                    width: '100% !important',
                }
            }}
        >
            <Bar
                data={{
                    labels: labelsMemo,
                    datasets: dataSets
                }}
                options={{
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: "Số lượng sản phẩm theo từng loại" }
                    }
                }}
            />
        </Box>
    )
}

export default CardProductType