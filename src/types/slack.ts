/**
 * Slack API types for the epoch configuration bot
 */

// Slack Block Kit types
export interface SlackTextObject {
  type: 'plain_text' | 'mrkdwn';
  text: string;
  emoji?: boolean;
}

export interface SlackOption {
  text: SlackTextObject;
  value: string;
}

export interface SlackButtonElement {
  type: 'button';
  text: SlackTextObject;
  action_id: string;
  value?: string;
  style?: 'primary' | 'danger';
  url?: string;
}

export interface SlackStaticSelectElement {
  type: 'static_select';
  action_id: string;
  placeholder?: SlackTextObject;
  options: SlackOption[];
  initial_option?: SlackOption;
}

export interface SlackMultiStaticSelectElement {
  type: 'multi_static_select';
  action_id: string;
  placeholder?: SlackTextObject;
  options: SlackOption[];
  initial_options?: SlackOption[];
  max_selected_items?: number;
}

export interface SlackNumberInputElement {
  type: 'number_input';
  action_id: string;
  is_decimal_allowed: boolean;
  initial_value?: string;
  min_value?: string;
  max_value?: string;
  placeholder?: SlackTextObject;
}

export interface SlackPlainTextInputElement {
  type: 'plain_text_input';
  action_id: string;
  placeholder?: SlackTextObject;
  initial_value?: string;
  multiline?: boolean;
}

// Block types
export interface SlackSectionBlock {
  type: 'section';
  block_id?: string;
  text?: SlackTextObject;
  fields?: SlackTextObject[];
  accessory?: SlackButtonElement | SlackStaticSelectElement;
}

export interface SlackDividerBlock {
  type: 'divider';
}

export interface SlackActionsBlock {
  type: 'actions';
  block_id?: string;
  elements: (SlackButtonElement | SlackStaticSelectElement | SlackMultiStaticSelectElement)[];
}

export interface SlackInputBlock {
  type: 'input';
  block_id: string;
  label: SlackTextObject;
  element: SlackStaticSelectElement | SlackMultiStaticSelectElement | SlackNumberInputElement | SlackPlainTextInputElement;
  optional?: boolean;
  hint?: SlackTextObject;
}

export interface SlackHeaderBlock {
  type: 'header';
  block_id?: string;
  text: SlackTextObject;
}

export interface SlackContextBlock {
  type: 'context';
  block_id?: string;
  elements: SlackTextObject[];
}

export type SlackBlock =
  | SlackSectionBlock
  | SlackDividerBlock
  | SlackActionsBlock
  | SlackInputBlock
  | SlackHeaderBlock
  | SlackContextBlock;

// Modal/View types
export interface SlackModal {
  type: 'modal';
  callback_id: string;
  title: SlackTextObject;
  submit?: SlackTextObject;
  close?: SlackTextObject;
  blocks: SlackBlock[];
  private_metadata?: string;
  clear_on_close?: boolean;
  notify_on_close?: boolean;
}

// Message types
export interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
  thread_ts?: string;
  reply_broadcast?: boolean;
  response_type?: 'in_channel' | 'ephemeral';
  replace_original?: boolean;
  delete_original?: boolean;
}

// Slash command payload
export interface SlackCommandPayload {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
  api_app_id: string;
}

// Interaction payload types
export interface SlackUser {
  id: string;
  username: string;
  name: string;
  team_id: string;
}

export interface SlackChannel {
  id: string;
  name: string;
}

export interface SlackTeam {
  id: string;
  domain: string;
}

export interface SlackAction {
  action_id: string;
  block_id: string;
  type: string;
  value?: string;
  selected_option?: SlackOption;
  selected_options?: SlackOption[];
}

export interface SlackViewState {
  values: Record<string, Record<string, {
    type: string;
    value?: string;
    selected_option?: SlackOption;
    selected_options?: SlackOption[];
  }>>;
}

export interface SlackView {
  id: string;
  team_id: string;
  type: string;
  blocks: SlackBlock[];
  private_metadata: string;
  callback_id: string;
  state: SlackViewState;
  hash: string;
  title: SlackTextObject;
  clear_on_close: boolean;
  notify_on_close: boolean;
  close: SlackTextObject | null;
  submit: SlackTextObject | null;
  root_view_id: string;
  app_id: string;
  external_id: string;
  app_installed_team_id: string;
  bot_id: string;
}

export interface SlackBlockActionsPayload {
  type: 'block_actions';
  user: SlackUser;
  api_app_id: string;
  token: string;
  container: {
    type: string;
    message_ts?: string;
    channel_id?: string;
    is_ephemeral?: boolean;
    view_id?: string;
  };
  channel?: SlackChannel;
  message?: {
    type: string;
    user: string;
    ts: string;
    bot_id?: string;
    app_id?: string;
    text: string;
    team: string;
    blocks: SlackBlock[];
  };
  view?: SlackView;
  team: SlackTeam;
  actions: SlackAction[];
  response_url?: string;
  trigger_id: string;
}

export interface SlackViewSubmissionPayload {
  type: 'view_submission';
  team: SlackTeam;
  user: SlackUser;
  api_app_id: string;
  token: string;
  trigger_id: string;
  view: SlackView;
  response_urls: string[];
}

export interface SlackViewClosedPayload {
  type: 'view_closed';
  team: SlackTeam;
  user: SlackUser;
  api_app_id: string;
  token: string;
  view: SlackView;
  is_cleared: boolean;
}

export type SlackInteractionPayload =
  | SlackBlockActionsPayload
  | SlackViewSubmissionPayload
  | SlackViewClosedPayload;

// API response types
export interface SlackApiResponse {
  ok: boolean;
  error?: string;
  response_metadata?: {
    messages?: string[];
  };
}

export interface SlackViewOpenResponse extends SlackApiResponse {
  view?: SlackView;
}

export interface SlackViewUpdateResponse extends SlackApiResponse {
  view?: SlackView;
}

export interface SlackChatPostMessageResponse extends SlackApiResponse {
  channel?: string;
  ts?: string;
  message?: {
    text: string;
    username: string;
    bot_id: string;
    type: string;
    subtype?: string;
    ts: string;
  };
}
