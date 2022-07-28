import styles from './styles.module.scss';
import RouterEndpoints from '@/common/RouterEndpoints';
import { useParams } from 'solid-app-router';
import { createEffect,  createSignal,  on, Show,} from 'solid-js';
import useStore from '@/chat-api/store/useStore';
import { createUpdatedSignal } from '@/common/createUpdatedSignal';
import SettingsBlock from '@/components/ui/settings-block';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { updateServerChannel } from '@/chat-api/services/ServerService';
import Modal from '@/components/ui/modal';
import { Channel } from '@/chat-api/store/useChannels';



export default function ServerSettingsChannel() {
  const {serverId, id: channelId} = useParams();
  const { tabs, channels } = useStore();

  const [saveRequestSent, setSaveRequestSent] = createSignal(false);
  const [error, setError] = createSignal<null | string>(null);

  const channel = () => channels.get(channelId);


  const defaultInput = () => ({
    name: channel()?.name || '',
  })

  const [inputValues, updatedInputValues, setInputValue] = createUpdatedSignal(defaultInput);



  
  createEffect(on(channel, () => {
    tabs.openTab({
      title: "Settings - " + channel().name,
      serverId: serverId!,
      iconName: 'settings',
      path: RouterEndpoints.SERVER_SETTINGS_CHANNEL(serverId!, channelId),
    });
  }))


  const onSaveButtonClicked = async () => {
    if (saveRequestSent()) return;
    setSaveRequestSent(true);
    setError(null);
    const values = updatedInputValues();
    await updateServerChannel(serverId!, channel()._id, values)
      .catch((err) => setError(err.message))
      .finally(() => setSaveRequestSent(false));
  }


  const saveRequestStatus = () => saveRequestSent() ? 'Saving...' : 'Save Changes';


  return (
    <div class={styles.channelPane}>
      {/* Channel Name */}
      <SettingsBlock icon='edit' label='Channel Name'>
        <Input value={inputValues().name} onText={(v) => setInputValue('name', v) } />
      </SettingsBlock>
      {/* Delete Channel */}
      <Modal show={true} title={`Delete ${channel().name}`} component={() => <DeleteConfirmModal channel={channel()} />} />
      <SettingsBlock icon='delete' label='Delete this channel' description='This cannot be undone!'>
        <Button label='Delete Channel' color='var(--alert-color)' />
      </SettingsBlock>
      {/* Errors & buttons */}
      <Show when={error()}><div class={styles.error}>{error()}</div></Show>
      <Show when={Object.keys(updatedInputValues()).length}>
        <Button iconName='save' label={saveRequestStatus()} class={styles.saveButton} onClick={onSaveButtonClicked} />
      </Show>
    </div>
  )
}

function DeleteConfirmModal(props: {channel: Channel}) {
  return (
    <div class={styles.deleteConfirmModal}>
      <div>Confirm by typing <span class={styles.highlight}>{props.channel?.name}</span> in the box below.</div>
      <Input />
      <Button iconName='delete' label={`Delete ${props.channel?.name}`} color="var(--alert-color)" />
    </div>
  )
}