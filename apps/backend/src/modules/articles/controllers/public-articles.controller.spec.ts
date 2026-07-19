import { PublicArticlesService } from '../services/public-articles.service';
import { PublicArticlesController } from './public-articles.controller';
import { PublicArticleQueryDto } from '../dto/public-article-query.dto';

function buildController() {
  const publicArticlesService = {
    listArticles: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getArticleBySlug: jest.fn().mockResolvedValue({}),
  } as unknown as PublicArticlesService;
  const controller = new PublicArticlesController(publicArticlesService);
  return { controller, publicArticlesService };
}

describe('PublicArticlesController', () => {
  it('listArticles delegates the query object as-is', async () => {
    const { controller, publicArticlesService } = buildController();
    const query = new PublicArticleQueryDto();
    await controller.listArticles(query);
    expect(publicArticlesService.listArticles).toHaveBeenCalledWith(query);
  });

  it('getArticleBySlug delegates with the slug param', async () => {
    const { controller, publicArticlesService } = buildController();
    await controller.getArticleBySlug('match-report');
    expect(publicArticlesService.getArticleBySlug).toHaveBeenCalledWith('match-report');
  });
});
