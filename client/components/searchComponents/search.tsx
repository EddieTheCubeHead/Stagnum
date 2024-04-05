import { Box, Grid } from '@mui/material'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import SearchInput from './searchInput'
import CollapseIconButton from '../buttons/iconButtons/collapseIconButton'
import DefaultButton from '../buttons/defaulButton'
import PoolInput from '../poolInput'
import { Pool } from '../types'

interface SearchProps {
    token: string
    updatePool: (pool: Pool) => void
    expanded: boolean
    toggleExpanded: () => void
    setSearchResults: (data: any) => void
    enableAddButton: () => void
}

const Search: React.FC<SearchProps> = ({ token, updatePool, expanded, toggleExpanded, setSearchResults, enableAddButton }) => {
    const mounted = useRef(false)
    const [query, setQuery] = useState('')
    const [idQuery, setIdQuery] = useState('')
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
        null,
    )

    const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

    const handleSearchRequest = (): void => {
        axios
            .get(`${backend_uri}/search`, {
                params: { query },
                headers: { token },
            })
            .then((response) => {
                if (!expanded) {
                    toggleExpanded()
                }
                setSearchResults(response.data)
            })
            .catch(() => {
                // TODO Error alert
            })
    }

    const handleJoinRequest = (): void => {
        axios
            .post(`${backend_uri}/pool/join/${idQuery}`, {
                headers: { token },
            })
            .then((response) => {
                updatePool(response.data)
                enableAddButton()
            })
            .catch(() => {
                // TODO Error alert
            })
    }

    const handleExpandClick = (): void => {
        toggleExpanded()
    }

    // useEffect to only execute search request after one second has passed from the last input
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true
        } else {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }

            const timeout = setTimeout(() => {
                handleSearchRequest()
            }, 1000)

            setSearchTimeout(timeout)

            // Cleanup function to clear the timeout when component unmounts or when query changes
            return () => {
                if (searchTimeout) {
                    clearTimeout(searchTimeout)
                }
            }
        }
    }, [query])

    return (
        <Box
            sx={{
                display: 'flex',
                width: 1,
                bgcolor: 'secondary.dark',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                borderBottomLeftRadius: expanded ? 0 : 12,
                borderBottomRightRadius: expanded ? 0 : 12,
                boxShadow: 2,
            }}
        >
            <Grid container marginX={1}>
                <Grid
                    item
                    xs={1}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    <CollapseIconButton
                        expanded={expanded}
                        handleExpandClick={handleExpandClick}
                    />
                </Grid>
                <Grid item xs={7}>
                    <SearchInput setQuery={setQuery} />
                </Grid>
                <Grid item xs={3}>
                    <PoolInput setQuery={setIdQuery} />
                </Grid>
                <Grid
                    item
                    xs={1}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    <DefaultButton text="Join" action={handleJoinRequest} />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Search