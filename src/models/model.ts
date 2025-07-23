import { Client } from '../client';

export interface ResourceAttributes {
  [key: string]: any;
}

export interface ResourceRelationships {
  [key: string]: any;
}

export class Model {
    public id: string | undefined;
    public name: string | undefined;
    public static type: string | undefined;
    protected client?: Client;
    public attributes: ResourceAttributes = {};
    public relationships: ResourceRelationships = {};
    public deleted: boolean = false;

    /**
     * Set the client reference for CRUD operations
     */
    public setClient(client: Client): this {
        this.client = client;
        return this;
    }

    /**
     * Get the resource type for this model
     */
    public getType(): string {
        return (this.constructor as typeof Model).type || 'unknown';
    }

    /**
     * Convert this resource to relationship format for JSON-API
     */
    public toRelationship(): { id: string; type: string } {
        if (!this.id) {
            throw new Error('Cannot create relationship without ID');
        }
        return { id: this.id, type: this.getType() };
    }

    /**
     * Refresh this resource from the API
     */
    public async refresh(): Promise<this> {
        if (!this.client || !this.id) {
            throw new Error('Cannot refresh: missing client or ID');
        }
        const updated = await this.client.get(this.getType(), this.id);
        Object.assign(this, updated);
        return this;
    }

    /**
     * Update this resource on the API
     */
    public async update(attributes: ResourceAttributes = {}, relationships: ResourceRelationships = {}): Promise<this> {
        if (!this.client || !this.id) {
            throw new Error('Cannot update: missing client or ID');
        }
        const updated = await this.client.update(this.getType(), this.id, attributes, relationships);
        Object.assign(this, updated);
        return this;
    }

    /**
     * Delete this resource from the API
     */
    public async delete(): Promise<void> {
        if (!this.client || !this.id) {
            throw new Error('Cannot delete: missing client or ID');
        }
        await this.client.delete(this.getType(), this.id);
        this.deleted = true;
    }

    /**
     * Check if this resource equals another resource
     */
    public equals(other: Model): boolean {
        return this.getType() === other.getType() && this.id === other.id;
    }
}
