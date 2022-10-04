import AccountDetails, { VolatileDetails } from './AccountDetails';
import Contact from './Contact';
import Conversation from './Conversation';
import { Lookup, PromiseExecutor } from './util';

type Devices = Record<string, string>;

export type RegistrationState =
  | 'UNREGISTERED'
  | 'TRYING'
  | 'REGISTERED'
  | 'ERROR_GENERIC'
  | 'ERROR_AUTH'
  | 'ERROR_NETWORK'
  | 'ERROR_HOST'
  | 'ERROR_SERVICE_UNAVAILABLE'
  | 'ERROR_NEED_MIGRATION'
  | 'INITIALIZING';

interface AccountRegisteringName extends PromiseExecutor<number> {
  name: string;
}

class Account {
  private readonly id: string;
  private _details: AccountDetails;
  private _volatileDetails: VolatileDetails;
  private readonly contactCache: Record<string, Contact>;
  private _contacts: Contact[];
  private readonly conversations: Record<string, Conversation>;
  private defaultModerators: Contact[];
  private _lookups: Lookup[];
  private devices: Devices;
  private _registrationState: RegistrationState | undefined;
  private _registeringName: AccountRegisteringName | undefined;

  static TYPE_JAMI: string;
  static TYPE_SIP: string;
  static BOOL_TRUE: string;
  static BOOL_FALSE: string;

  constructor(id: string, details: AccountDetails, volatileDetails: VolatileDetails) {
    this.id = id;
    this._details = details || {};
    this._volatileDetails = volatileDetails || {};
    this.contactCache = {};
    this._contacts = [];
    this.conversations = {};
    this.defaultModerators = [];
    this._lookups = [];
    this.devices = {};
    this.registrationState = undefined;
    this._registeringName = undefined;
  }

  static from(object: any) {
    const account = new Account(object.id, object.details, object.volatileDetails);
    if (object.defaultModerators) account.defaultModerators = object.defaultModerators.map((m: any) => Contact.from(m));
    return account;
  }

  update(data: Account) {
    this._details = data._details;
    this._volatileDetails = data._volatileDetails;
  }

  async getObject() {
    const hasModerators = this.defaultModerators && this.defaultModerators.length;
    return {
      id: this.id,
      details: this._details,
      defaultModerators: hasModerators
        ? await Promise.all(this.defaultModerators.map(async (c) => await c.getObject()))
        : undefined,
      volatileDetails: this._volatileDetails,
    };
  }

  getId() {
    return this.id;
  }

  getType() {
    return this._details['Account.type'];
  }

  getUri() {
    return this._details['Account.username'];
  }

  getRegisteredName() {
    return this._volatileDetails['Account.registeredName'];
  }

  isRendezVous() {
    return this._details['Account.rendezVous'] === Account.BOOL_TRUE;
  }

  isPublicIn() {
    return this._details['DHT.PublicInCalls'] === Account.BOOL_TRUE;
  }

  setDetail(detail: keyof AccountDetails, value: string) {
    this._details[detail] = value;
  }

  updateDetails(details: Partial<AccountDetails>) {
    return Object.assign(this._details, details);
  }

  getDetails() {
    return this._details;
  }

  getSummary() {
    return this.getObject();
  }

  getDisplayName() {
    return this._details['Account.displayName'] || this.getDisplayUri();
  }

  getDisplayUri() {
    return this.getRegisteredName() || this.getUri();
  }

  getDisplayNameNoFallback() {
    return this._details['Account.displayName'] || this.getRegisteredName();
  }

  getConversationIds() {
    return Object.keys(this.conversations);
  }

  getConversations() {
    return this.conversations;
  }

  getConversation(conversationId: string) {
    return this.conversations[conversationId];
  }

  addConversation(conversation: Conversation) {
    const conversationId = conversation.getId();
    if (conversationId != null) {
      this.conversations[conversationId] = conversation;
    } else {
      throw new Error('Conversation ID cannot be undefined');
    }
  }

  removeConversation(conversationId: string) {
    delete this.conversations[conversationId];
  }

  getContactFromCache(uri: string) {
    let contact = this.contactCache[uri];
    if (!contact) {
      contact = new Contact(uri);
      this.contactCache[uri] = contact;
    }
    return contact;
  }

  getContacts() {
    return this._contacts;
  }

  set contacts(contacts: Contact[]) {
    this._contacts = contacts;
  }

  getDefaultModerators() {
    return this.defaultModerators;
  }

  set details(value: AccountDetails) {
    this._details = value;
  }

  set volatileDetails(value: VolatileDetails) {
    this._volatileDetails = value;
  }

  get lookups(): Lookup[] {
    return this._lookups;
  }

  set lookups(lookups: Lookup[]) {
    this._lookups = lookups;
  }

  setDevices(devices: Devices) {
    this.devices = { ...devices };
  }

  getDevices() {
    return this.devices;
  }

  get registrationState(): RegistrationState | undefined {
    return this._registrationState;
  }

  set registrationState(registrationState: RegistrationState | undefined) {
    this._registrationState = registrationState;
  }

  get registeringName(): AccountRegisteringName | undefined {
    return this._registeringName;
  }

  set registeringName(registeringName: AccountRegisteringName | undefined) {
    this._registeringName = registeringName;
  }
}

Account.TYPE_JAMI = 'RING';
Account.TYPE_SIP = 'SIP';

Account.BOOL_TRUE = 'true';
Account.BOOL_FALSE = 'false';

export default Account;
