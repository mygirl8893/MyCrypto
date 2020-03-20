import React, { useState, useContext } from 'react';
import { Heading } from '@mycrypto/ui';
import styled from 'styled-components';
import translate from 'v2/translations';

import { IS_MOBILE } from 'v2/utils';
import { BREAK_POINTS, MIN_CONTENT_PADDING } from 'v2/theme';
import {
  AddressBookContext,
  NetworkContext,
  SettingsContext,
  StoreContext
} from 'v2/services/Store';
import { AccountList, FlippablePanel, TabsNav } from 'v2/components';
import { NetworkId } from 'v2/types';
import { CustomNodeConfig } from 'v2/types/node';
import { DEFAULT_NETWORK, IS_ACTIVE_FEATURE } from 'v2/config';

import settingsIcon from 'common/assets/images/icn-settings.svg';
import NetworkNodes from './components/NetworkNodes';
import AddOrEditNetworkNode from './components/AddOrEditNetworkNode';
import { AddressBookPanel, AddToAddressBook, GeneralSettings, DangerZone } from './components';

const SettingsHeading = styled(Heading)`
  display: flex;
  align-items: center;
  margin-bottom: 22px;
  color: #163150;
`;

const SettingsHeadingIcon = styled.img`
  margin-right: 12px;
`;

const StyledLayout = styled.div`
  width: 960px;
  @media (max-width: ${BREAK_POINTS.SCREEN_SM}) {
    width: 100%;
  }
  .Layout-content {
    padding: 0;
  }
  @media (max-width: ${BREAK_POINTS.SCREEN_SM}) {
    .Layout-content {
      margin-top: ${IS_MOBILE && '73px'};
    }
  }
`;

const SettingsTabs = styled(TabsNav)`
  margin-top: -44px;
  margin-left: -${MIN_CONTENT_PADDING};
  margin-right: -${MIN_CONTENT_PADDING};
`;

function renderAccountPanel() {
  const { accounts } = useContext(StoreContext);
  return (
    <FlippablePanel>
      {({ flipped }) =>
        flipped ? (
          <p>Add Account</p>
        ) : (
          <AccountList
            accounts={accounts}
            deletable={true}
            copyable={true}
            privacyCheckboxEnabled={IS_ACTIVE_FEATURE.PRIVATE_TAGS}
          />
        )
      }
    </FlippablePanel>
  );
}

function renderAddressPanel() {
  const { createAddressBooks, addressBook, deleteAddressBooks, updateAddressBooks } = useContext(
    AddressBookContext
  );
  return (
    <FlippablePanel>
      {({ flipped, toggleFlipped }) =>
        flipped ? (
          <AddToAddressBook toggleFlipped={toggleFlipped} createAddressBooks={createAddressBooks} />
        ) : (
          <AddressBookPanel
            addressBook={addressBook}
            toggleFlipped={toggleFlipped}
            updateAddressBooks={updateAddressBooks}
            deleteAddressBooks={deleteAddressBooks}
          />
        )
      }
    </FlippablePanel>
  );
}

function renderNetworkNodes() {
  const {
    getNetworkByName,
    addNodeToNetwork,
    isNodeNameAvailable,
    getNetworkById,
    updateNode,
    deleteNode
  } = useContext(NetworkContext);
  const { addressBook } = useContext(AddressBookContext);
  const [networkId, setNetworkId] = useState<NetworkId>(DEFAULT_NETWORK);
  const [editNode, setEditNode] = useState<CustomNodeConfig | undefined>(undefined);

  const addressBookNetworksIds = [...new Set(addressBook.map(a => a.network))];
  const addressBookNetworks = addressBookNetworksIds.map(addressId => getNetworkByName(addressId)!);

  return (
    <FlippablePanel>
      {({ flipped, toggleFlipped }) =>
        flipped ? (
          <AddOrEditNetworkNode
            networkId={networkId}
            editNode={editNode}
            toggleFlipped={toggleFlipped}
            addNodeToNetwork={addNodeToNetwork}
            isNodeNameAvailable={isNodeNameAvailable}
            getNetworkById={getNetworkById}
            updateNode={updateNode}
            deleteNode={deleteNode}
          />
        ) : (
          <NetworkNodes
            networks={addressBookNetworks}
            toggleFlipped={(id, node) => {
              setNetworkId(id);
              setEditNode(node);

              toggleFlipped();
            }}
          />
        )
      }
    </FlippablePanel>
  );
}

function renderGeneralSettingsPanel() {
  const { updateSettings, settings } = useContext(SettingsContext);
  return (
    <>
      <GeneralSettings updateGlobalSettings={updateSettings} globalSettings={settings} />
      <DangerZone />
    </>
  );
}

interface TabOptions {
  [key: string]: React.ReactNode;
}

function renderMobile() {
  const [tab, setTab] = useState('accounts');
  const tabOptions: TabOptions = {
    ['accounts']: renderAccountPanel(),
    ['addresses']: renderAddressPanel(),
    ['general']: renderGeneralSettingsPanel()
  };
  const currentTab = tabOptions[tab];
  return (
    <>
      <SettingsTabs>
        <a href="#" onClick={() => setTab('accounts')}>
          Accounts
        </a>
        <a href="#" onClick={() => setTab('addresses')}>
          Addresses
        </a>
        <a href="#" onClick={() => setTab('general')}>
          General
        </a>
      </SettingsTabs>
      <>{currentTab}</>
    </>
  );
}

function renderDesktop() {
  return (
    <>
      <SettingsHeading>
        <SettingsHeadingIcon src={settingsIcon} alt="Settings" />
        {translate('SETTINGS_HEADING')}
      </SettingsHeading>
      {renderAccountPanel()}
      {renderAddressPanel()}
      {renderNetworkNodes()}
      {renderGeneralSettingsPanel()}
    </>
  );
}

// @TODO: Use { Desktop, Mobile } components instead
export default function Settings() {
  return <StyledLayout>{IS_MOBILE ? renderMobile() : renderDesktop()}</StyledLayout>;
}
