import { SweetAlertIcon } from 'sweetalert2';

export enum TYPE_ALERT {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
  QUESTION = 'question',
  LOADING = 'loading'
}

// Definir una función de mapeo para convertir TYPE_ALERT a SweetAlertIcon
export function mapTypeAlertToSweetAlertIcon(type: TYPE_ALERT): SweetAlertIcon {
  switch(type) {
    case TYPE_ALERT.ERROR:
      return 'error';
    case TYPE_ALERT.SUCCESS:
      return 'success';
    case TYPE_ALERT.WARNING:
      return 'warning';
    case TYPE_ALERT.INFO:
      return 'info';
    case TYPE_ALERT.QUESTION:
      return 'question';
    default:
      // Para LOADING o cualquier otro caso, usar info como valor predeterminado
      return 'info';
  }
}
