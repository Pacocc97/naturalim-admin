// src/modules/resend/service.ts
import {
  AbstractNotificationProviderService,
  MedusaError,
} from '@medusajs/framework/utils';
import {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from '@medusajs/framework/types';
import { Resend, CreateEmailOptions } from 'resend';
import React from 'react';

type ResendOptions = {
  api_key: string;
  from: string;
  html_templates?: Record<
    string,
    {
      subject?: string;
      content: string;
    }
  >;
};

type InjectedDependencies = {
  logger: Logger;
};

enum Templates {
  ORDER_PLACED = 'order-placed',
}

// Importaremos nuestro template en un paso posterior
const templates: { [key in Templates]?: (props: unknown) => React.ReactNode } =
  {
    // Se llena después (ver más abajo)
  };

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = 'notification-resend';
  private resendClient: Resend;
  private options: ResendOptions;
  private logger: Logger;

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super();
    this.logger = logger;
    this.options = options;
    this.resendClient = new Resend(options.api_key);
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Option `api_key` is required.',
      );
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Option `from` is required.',
      );
    }
  }

  getTemplate(template: Templates) {
    // Si está sobreescrito en html_templates:
    if (this.options.html_templates?.[template]) {
      return this.options.html_templates[template].content;
    }

    // Si no existe en la lista:
    const allowed = Object.keys(templates);
    if (!allowed.includes(template)) {
      return null;
    }

    return templates[template];
  }

  getTemplateSubject(template: Templates) {
    if (this.options.html_templates?.[template]?.subject) {
      return this.options.html_templates[template].subject;
    }
    switch (template) {
      case Templates.ORDER_PLACED:
        return 'Order Confirmation';
      default:
        return 'New Email';
    }
  }

  async send(
    notification: ProviderSendNotificationDTO,
  ): Promise<ProviderSendNotificationResultsDTO> {
    const template = this.getTemplate(notification.template as Templates);

    if (!template) {
      this.logger.error(`No se encontró el template ${notification.template}.`);
      return {};
    }

    const emailOptions: CreateEmailOptions = {
      from: this.options.from,
      to: [notification.to],
      subject: this.getTemplateSubject(notification.template as Templates),
      html: '',
    };

    // Si el template es string, se manda como HTML; si es React, se pasa al prop react
    if (typeof template === 'string') {
      emailOptions.html = template;
    } else {
      emailOptions.react = template(notification.data);
      delete emailOptions.html;
    }

    const { data, error } = await this.resendClient.emails.send(emailOptions);

    if (error) {
      this.logger.error('Failed to send email', error);
      return {};
    }

    return { id: data?.id };
  }
}

export default ResendNotificationProviderService;
