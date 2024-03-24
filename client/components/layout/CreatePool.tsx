import { Box, CardMedia, Grid, IconButton } from '@mui/material'
import { Header1, Header3 } from '../textComponents'
import React from 'react'
import DefaultButton from '../buttons/defaulButton'
import Album from '@/types/albumTypes'
import DeleteIcon from '@mui/icons-material/Delete'
import axios from 'axios'
interface Props {
    token: string
    selectedCollections: Array<Album>
    handleDelete: (itemToDelete: Album) => void
}

export default function CreatePool({
    token,
    selectedCollections,
    handleDelete,
}: Props) {
    const createPool = () => {
        const requestData = {
            spotify_uris: [
                {
                    spotify_uri: selectedCollections[0].uri,
                },
            ],
        }

        axios
            .post('http://localhost:8080/pool', requestData, {
                headers: { token },
            })
            .then((response) => {
                console.log(response)
            })
            .catch((error) => {
                console.log('Request failed', error)
            })
    }

    return (
        <Grid
            container
            sx={{
                bgcolor: 'secondary.main',
                borderRadius: 1,
            }}
        >
            <Grid
                item
                xs={12}
                m={2}
                sx={{ bgcolor: 'primary.main', borderRadius: 1 }}
            >
                <Box m={1}>
                    <Header1 text="Create a Pool" fontWeight={'bold'} />
                </Box>
            </Grid>
            <Grid
                item
                xs={12}
                container
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                {selectedCollections.map((item, key) => (
                    <Grid
                        item
                        xs={5}
                        key={key}
                        container
                        direction={'column'}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        m={1}
                        sx={{
                            bgcolor: 'secondary.light',
                            borderRadius: 1,
                        }}
                    >
                        <Grid
                            item
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            m={1}
                        >
                            <CardMedia
                                component="img"
                                image={item.icon_link}
                                alt={item.name}
                            />
                        </Grid>
                        <Grid
                            item
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            m={1}
                        >
                            <Header3 fontWeight={'bold'} text={item.name} />
                            <IconButton onClick={() => handleDelete(item)}>
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
            <Grid
                item
                xs={12}
                marginY={2}
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <DefaultButton text="create" action={createPool} />
            </Grid>
        </Grid>
    )
}
