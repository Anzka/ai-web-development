import type { Book } from '@/types/Book'

export const books: Book[] = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: 1925,
    isbn: '978-0-7432-7356-5',
    description:
      'A classic American novel set in the Jazz Age, exploring themes of decadence, idealism, and social upheaval.',
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    year: 1960,
    isbn: '978-0-06-112008-4',
    description:
      'A gripping tale of racial injustice and childhood innocence in the American South.',
  },
  {
    id: 3,
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    isbn: '978-0-452-28423-4',
    description:
      'A dystopian social science fiction novel and cautionary tale about totalitarianism.',
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    isbn: '978-0-14-143951-8',
    description:
      'A romantic novel of manners that critiques the British landed gentry at the end of the 18th century.',
  },
  {
    id: 5,
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    year: 1951,
    isbn: '978-0-316-76948-0',
    description:
      'A story about teenage rebellion and alienation narrated by the iconic Holden Caulfield.',
  },
]
