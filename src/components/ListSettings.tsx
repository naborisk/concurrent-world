import { Box, Button, IconButton, List, ListItem, Switch, Tab, Tabs, TextField, Typography } from '@mui/material'
import { StreamPicker } from './ui/StreamPicker'
import { useEffect, useState } from 'react'
import { usePreference } from '../context/PreferenceContext'
import { type CoreSubscription, type CommonstreamSchema, type Timeline } from '@concurrent-world/client'
import { useClient } from '../context/ClientContext'
import { StreamLink } from './StreamList/StreamLink'
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'
import { useTranslation } from 'react-i18next'
import { type StreamList } from '../model'

export interface ListSettingsProps {
    subscription: CoreSubscription<any>
}

export function ListSettings(props: ListSettingsProps): JSX.Element {
    const { client } = useClient()
    const [lists, setLists] = usePreference('lists')
    const [listName, setListName] = useState<string>('')

    const { t } = useTranslation('', { keyPrefix: 'ui.listSettings' })

    const [options, setOptions] = useState<Array<Timeline<CommonstreamSchema>>>([])
    const [postStreams, setPostStreams] = useState<Array<Timeline<CommonstreamSchema>>>([])

    const [tab, setTab] = useState<'stream' | 'user'>('stream')

    const list = lists[props.subscription.id]

    useEffect(() => {
        if (!list) return
        Promise.all(props.subscription.items.map((sub) => client.getTimeline(sub.id))).then((streams) => {
            setOptions(streams.filter((e) => e !== null) as Array<Timeline<CommonstreamSchema>>)
        })

        Promise.all(list.defaultPostStreams.map((streamID) => client.getTimeline(streamID))).then((streams) => {
            setPostStreams(streams.filter((stream) => stream !== null) as Array<Timeline<CommonstreamSchema>>)
        })
    }, [props.subscription])

    const updateList = (id: string, list: StreamList): void => {
        const old = lists
        old[id] = list
        setLists(JSON.parse(JSON.stringify(old)))
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1
            }}
        >
            <Typography variant="h2">{t('title')}</Typography>
            <Typography variant="h3">{t('name')}</Typography>
            <Box display="flex" flexDirection="row">
                <TextField
                    label="list name"
                    variant="outlined"
                    value={listName}
                    sx={{
                        flexGrow: 1
                    }}
                    onChange={(e) => {
                        setListName(e.target.value)
                    }}
                />
                <Button
                    onClick={(_) => {
                        // TODO
                    }}
                >
                    {t('update')}
                </Button>
            </Box>
            <Typography variant="h3">{t('defaultDest')}</Typography>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1
                }}
            >
                <StreamPicker
                    options={options}
                    selected={postStreams}
                    setSelected={(value) => {
                        updateList(props.subscription.id, {
                            ...list,
                            defaultPostStreams: value.map((e) => e.id)
                        })
                        setPostStreams(value)
                    }}
                />
            </Box>
            <Typography variant="h3">{t('pin')}</Typography>
            <Switch
                checked={list.pinned}
                onChange={(_) => {
                    updateList(props.subscription.id, {
                        ...list,
                        pinned: !list.pinned
                    })
                }}
            />
            <Button
                color="error"
                onClick={(_) => {
                    const old = lists
                    delete old[props.subscription.id]
                    setLists(JSON.parse(JSON.stringify(old)))
                }}
            >
                {t('delete')}
            </Button>
            <Tabs
                value={tab}
                onChange={(_, value) => {
                    setTab(value)
                }}
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab label={t('stream')} value="stream" />
                <Tab label={t('user')} value="user" />
            </Tabs>
            <List>
                {props.subscription.items.map((sub) => (
                    <ListItem
                        key={sub.id}
                        disablePadding
                        secondaryAction={
                            <IconButton
                                onClick={(_) => {
                                    // TODO: unsubscribe
                                }}
                            >
                                <PlaylistRemoveIcon />
                            </IconButton>
                        }
                    >
                        <StreamLink streamID={sub.id} />
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}
