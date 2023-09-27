import { useEffect, useMemo, useReducer, useState } from "react";
import Link from 'next/link'
import { trpc } from '@/utils/trpc';
import { UsageReport } from "@/types/admin";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { useSession } from "next-auth/react";
import { UserRole } from "@/types/user";

function UsageReportTable({ start }: { start: Date }) {
    const end = new Date(start.getFullYear(), start.getMonth() + 1);
    const startTs = start.valueOf();
    const endTs = end.valueOf();
    const usageReportQuery = trpc.admin.usageReport.useQuery({ start: startTs, end: endTs });
    const [data, setData] = useState<UsageReport[]>([]);
    const [sorting, setSorting] = useState<SortingState>([])
    const columns = useMemo<ColumnDef<UsageReport>[]>(
        () => {
            const USDollar = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            });
            return [
            {
                header: 'User',
                footer: props => props.column.id,
                columns: [
                    {
                        accessorFn: row => row.user.name,
                        id: 'name',
                        cell: info => info.getValue(),
                        header: 'Name',
                        footer: props => props.column.id,
                    },
                    {
                        accessorFn: row => row.user.email,
                        id: 'email',
                        cell: info => info.getValue(),
                        header: 'Email',
                        footer: props => props.column.id,
                    },
                ],
            },
            {
                header: 'Usage',
                footer: props => props.column.id,
                columns: [
                    {
                        accessorKey: 'totalPriceUSD',
                        cell: cell => USDollar.format(cell.getValue()),
                        header: 'Cost',
                        footer: props => props.column.id,
                    },
                    {
                        accessorKey: 'conversions',
                        header: 'Conversions',
                        footer: props => props.column.id,
                    },
                    {
                        accessorKey: 'tokens',
                        header: 'Tokens',
                        footer: props => props.column.id,
                    },
                ]
            }
            ]
        },
        []
    )
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // debugTable: true,
    })

    useEffect(() => {
        // console.info(apiResponse);
        setData(usageReportQuery.data || []);
    }, [usageReportQuery.data]);

    if (usageReportQuery.isLoading) {
        return <div>Loading...</div>
    }
    if (usageReportQuery.isError) {
        return <div>Error: {usageReportQuery.error.message}</div>
    }

    return (
        <table className="w-full border-collapse border border-slate-500">
            <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => {
                            return (
                                <th className="border border-slate-600" key={header.id} colSpan={header.colSpan}>
                                    {header.isPlaceholder ? null : (
                                        <div
                                            {...{
                                                className: header.column.getCanSort()
                                                    ? 'cursor-pointer select-none'
                                                    : '',
                                                onClick: header.column.getToggleSortingHandler(),
                                            }}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: ' 🔼',
                                                desc: ' 🔽',
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                    )}
                                </th>
                            )
                        })}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table
                    .getRowModel()
                    .rows
                    .map(row => {
                        return (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => {
                                    return (
                                        <td className="border border-slate-700" key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
            </tbody>
        </table>
    );
}

function AdminPage() {
    const session = useSession()
    const isAdminUser: boolean = session.data?.user?.role === UserRole.ADMIN;
    const now = new Date();
    const [startDate, setStartDate] = useState(new Date(now.getFullYear(), now.getMonth()));
    const handlePreviousMonth = () => {
        let currentMonth = startDate.getMonth();
        let currentYear = startDate.getFullYear();
        if (currentMonth > 0) {
            currentMonth -= 1;
        } else {
            currentMonth = 11;
            currentYear -= 1;
        }
        setStartDate(new Date(currentYear, currentMonth));
    };

    const handleNextMonth = () => {
        let currentMonth = startDate.getMonth();
        let currentYear = startDate.getFullYear();
        if (currentMonth < 11) {
            currentMonth += 1;

        } else {
            currentMonth = 0;
            currentYear += 1;
        }
        setStartDate(new Date(currentYear, currentMonth));
    };
    if (!session.data?.user) {
        return <h1 className="text-white">You need to <Link className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href="/api/auth/signin?callbackUrl=%2Fadmin">log in</Link> to view this page.</h1>
    }
    if (!isAdminUser) {
        return <h1 className="text-white">Admin permission required.</h1>
    }
    return (
        <div className="container mx-auto text-white">
            <div className="flex flex-row items-center justify-center">
                <button className="flex w-1/4 cursor-pointer select-none items-center justify-start gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
                    onClick={handlePreviousMonth}>
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" />
                    </svg>
                    Previous Month
                </button>
                <h1 className="flex w-1/2 items-center justify-center">Monthly Cost Summary: {startDate.getFullYear()}/{startDate.getMonth() + 1}</h1> {/* Months are 0-indexed in JavaScript */}
                <button className="flex w-1/4 cursor-pointer select-none items-center justify-end gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
                    onClick={handleNextMonth}>
                    Next Month
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1" />
                    </svg>
                </button>
            </div>
            <div className="flex flex-row items-center justify-center">
                <UsageReportTable start={startDate} />
            </div>
        </div>
    );
}
export default AdminPage;
