import ru from '../messages/ru.json';

type Messages = typeof ru;

declare global {
  // Use type safe message keys with `next-intl`
  // eslint-disable-next-line no-unused-vars
  interface IntlMessages extends Messages {}
}
