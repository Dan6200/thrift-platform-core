declare module '@paystack/paystack-sdk' {
  interface PaystackResourceInstance {
    [method: string]: (...args: any[]) => Promise<any> | any
  }

  // Define external types that Transaction depends on
  // These should match the actual structure from your Paystack SDK's runtime and models directories
  export class BaseAPI {
    protected request(context: {
      path: string
      method: string
      query: any
      body?: any
      headers?: any
    }): Promise<any>
  }
  export class RequiredError extends Error {
    name: 'RequiredError'
    constructor(field: string, msg?: string)
  }

  export interface Response {
    status: boolean
    message: string
    data: any // You might want to refine this 'any' if you have a specific Response model
  }
  export function ResponseFromJSON(json: any): Response // Assuming this is a utility function

  // --- Request Interfaces for Transaction ---
  export interface ChargeAuthorizationRequest {
    email: string
    amount: number
    authorization_code: string
    reference?: string
    currency?: string
    metadata?: string
    split_code?: string
    subaccount?: string
    transaction_charge?: string
    bearer?: string
    queue?: boolean
  }

  export interface CheckAuthorizationRequest {
    email: string
    amount: number
    authorization_code?: string
    currency?: string
  }

  export interface DownloadRequest {
    perPage?: number
    page?: number
    from?: Date
    to?: Date
  }

  export interface EventRequest {
    id: string
  }

  export interface FetchRequest {
    id: string
  }

  export interface InitializeRequest {
    email: string
    amount: number
    currency?: string
    reference?: string
    callback_url?: string
    plan?: string
    invoice_limit?: number
    metadata?: string
    channels?: Array<string>
    split_code?: string
    subaccount?: string
    transaction_charge?: string
    bearer?: string
  }

  export interface ListRequest {
    perPage?: number
    page?: number
    from?: Date
    to?: Date
  }

  export interface PartialDebitRequest {
    email: string
    amount: number
    authorization_code: string
    currency: string
    reference?: string
    at_least?: string
  }

  export interface SessionRequest {
    id: string
  }

  export interface TimelineRequest {
    id_or_reference: string
  }

  export interface TotalsRequest {
    perPage?: number
    page?: number
    from?: Date
    to?: Date
  }

  export interface VerifyRequest {
    reference: string
  }

  /**
   * Paystack Transaction API Resource
   */
  export class Transaction extends BaseAPI {
    chargeAuthorization(
      requestParameters: ChargeAuthorizationRequest,
    ): Promise<Response>
    checkAuthorization(
      requestParameters: CheckAuthorizationRequest,
    ): Promise<Response>
    download(requestParameters: DownloadRequest): Promise<Response>
    event(requestParameters: EventRequest): Promise<Response>
    fetch(requestParameters: FetchRequest): Promise<Response>
    initialize(requestParameters: InitializeRequest): Promise<Response>
    list(requestParameters: ListRequest): Promise<Response>
    partialDebit(requestParameters: PartialDebitRequest): Promise<Response>
    session(requestParameters: SessionRequest): Promise<Response>
    timeline(requestParameters: TimelineRequest): Promise<Response>
    totals(requestParameters: TotalsRequest): Promise<Response>
    verify(requestParameters: VerifyRequest): Promise<Response>
  }

  // Interface for a Paystack resource class (the constructor)
  interface PaystackResourceClass {
    new (apiKey: string): any // The constructor takes an API key
  }

  class Paystack {
    [index: string]: PaystackResourceInstance | any

    constructor(apiKey: string)

    // Explicitly type the transaction property
    transaction: Transaction

    // ... other dynamically added resource properties (Balance, BulkCharge, etc. as PaystackResourceClass instances)
    balance: PaystackResourceClass
    bulkCharge: PaystackResourceClass
    charge: PaystackResourceClass
    customer: PaystackResourceClass
    dedicatedVirtualAccount: PaystackResourceClass
    dispute: PaystackResourceClass
    integration: PaystackResourceClass
    page: PaystackResourceClass
    paymentRequest: PaystackResourceClass
    plan: PaystackResourceClass
    product: PaystackResourceClass
    refund: PaystackResourceClass
    settlement: PaystackResourceClass
    split: PaystackResourceClass
    subaccount: PaystackResourceClass
    subscription: PaystackResourceClass
    transfer: PaystackResourceClass
    transferRecipient: PaystackResourceClass
    verification: PaystackResourceClass

    private extend(apiKey: string): void
    private toCamelCase(resource: string): string
    private cleanResourceKey(resource: string): string | null
  }

  export = Paystack
  export default Paystack
}
